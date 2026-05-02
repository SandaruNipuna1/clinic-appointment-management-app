// Import the database models for appointments, doctors, and patients
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
// Helper function to handle errors in async functions
const asyncHandler = require("../utils/asyncHandler");
// Helper function to create unique appointment codes
const generateEntityCode = require("../utils/generateEntityCode");

// Turn the appointment data into a regular object so we can send it to the frontend
const serializeAppointment = (appointment) => ({
  ...(typeof appointment.toObject === "function" ? appointment.toObject() : appointment),
  date: appointment.date
});

// Check if a doctor already has an appointment at the same date and time
const findConflictingAppointment = ({ appointmentId, doctorId, date, time }) =>
  Appointment.findOne({
    ...(appointmentId ? { _id: { $ne: appointmentId } } : {}),
    doctorId,
    date,
    time,
    status: { $ne: "Cancelled" } // Don't count cancelled appointments
  }).lean();

// Make sure the doctor's time slot is available, throw error if not
const assertSlotIsAvailable = async ({ appointmentId, doctorId, date, time }) => {
  const conflictingAppointment = await findConflictingAppointment({
    appointmentId,
    doctorId,
    date,
    time
  });

  if (conflictingAppointment) {
    const error = new Error("This doctor already has an appointment for the selected date and time");
    error.statusCode = 409;
    throw error;
  }
};

// For patients, create a search query to find only their own appointments
const getPatientAppointmentQuery = async (user) => {
  const linkedPatients = user.email
    ? await Patient.find({ email: user.email.trim().toLowerCase() }).select("_id").lean()
    : [];
  const linkedPatientIds = linkedPatients.map((patient) => patient._id);

  return {
    $or: [{ patientId: user.id }, ...(linkedPatientIds.length > 0 ? [{ patientId: { $in: linkedPatientIds } }] : [])]
  };
};

// Check if a patient is allowed to view a specific appointment
const canPatientAccessAppointment = async (appointmentId, user) => {
  const query = await getPatientAppointmentQuery(user);

  return Appointment.exists({
    _id: appointmentId,
    ...query
  });
};

// Get all appointments - patients see only theirs, staff see all
const getAppointments = asyncHandler(async (req, res) => {
  // If the user is a patient, only get their appointments; otherwise get all
  const query = req.user.role === "patient" ? await getPatientAppointmentQuery(req.user) : {};
  const appointments = await Appointment.find(query)
    .sort({ date: -1, time: -1 }) // Show newest appointments first
    .lean();

  res.status(200).json(appointments);
});

// Get one appointment by ID - check that the user has permission to see it
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // If the user is a patient, make sure they can only see their own appointment
  if (req.user.role === "patient") {
    const canAccessAppointment = await canPatientAccessAppointment(appointment._id, req.user);

    if (!canAccessAppointment) {
      res.status(403);
      throw new Error("Access denied");
    }
  }

  res.status(200).json(appointment);
});

// Create a new appointment - first check doctor exists and the time slot is free
const createAppointment = asyncHandler(async (req, res) => {
  // Look up the doctor to make sure they exist and are active
  const doctor = await Doctor.findOne({
    _id: req.body.doctorId,
    isActive: true
  });

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  // Convert the date string into a proper date object
  const appointmentDate = new Date(`${req.body.date}T00:00:00.000Z`);

  // Check that the doctor doesn't already have an appointment at this time
  await assertSlotIsAvailable({
    doctorId: doctor._id,
    date: appointmentDate,
    time: req.body.time
  });

  const isPatient = req.user.role === "patient";

  // Create the appointment in the database
  const appointment = await Appointment.create({
    appointmentCode: await generateEntityCode(Appointment, "appointmentCode", "APT"),
    patientId: isPatient ? req.user.id : req.body.patientId || null, // Patients book for themselves
    patientName: isPatient ? req.user.fullName : req.body.patientName.trim(),
    doctorId: doctor._id,
    doctorName: doctor.name,
    date: appointmentDate,
    time: req.body.time,
    reason: req.body.reason.trim(),
    status: "Scheduled" // New appointments start as scheduled
  });

  res.status(201).json(serializeAppointment(appointment));
});

// Update an existing appointment - patients can only cancel, staff can edit details
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const isPatient = req.user.role === "patient";

  // If patient, check they can access this appointment
  if (isPatient) {
    const canAccessAppointment = await canPatientAccessAppointment(appointment._id, req.user);

    if (!canAccessAppointment) {
      res.status(403);
      throw new Error("Access denied");
    }
  }

  // Patients can only cancel their appointments, nothing else
  if (isPatient) {
    if (req.body.status !== "Cancelled") {
      res.status(403);
      throw new Error("Patients can only cancel their own appointments");
    }

    appointment.status = "Cancelled";
    const cancelledAppointment = await appointment.save();
    res.status(200).json(serializeAppointment(cancelledAppointment));
    return;
  }

  // Staff (admin/receptionist) can edit any appointment details
  let nextDoctorId = appointment.doctorId;
  let nextDate = appointment.date;
  let nextTime = appointment.time;
  const nextStatus = req.body.status || appointment.status;

  // If they're changing the doctor, verify the new doctor exists
  if (req.body.doctorId) {
    const doctor = await Doctor.findOne({
      _id: req.body.doctorId,
      isActive: true
    });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    appointment.doctorId = doctor._id;
    appointment.doctorName = doctor.name;
    nextDoctorId = doctor._id;
  }

  // Update patient info if provided
  if (req.body.patientId !== undefined) {
    appointment.patientId = req.body.patientId || null;
  }

  if (req.body.patientName) {
    appointment.patientName = req.body.patientName.trim();
  }

  // Update date if provided
  if (req.body.date) {
    nextDate = new Date(`${req.body.date}T00:00:00.000Z`);
    appointment.date = nextDate;
  }

  // Update time if provided
  if (req.body.time) {
    nextTime = req.body.time;
    appointment.time = req.body.time;
  }

  // Update reason if provided
  if (req.body.reason) {
    appointment.reason = req.body.reason.trim();
  }

  // Update status if provided
  if (req.body.status) {
    appointment.status = req.body.status;
  }

  // If the appointment is not being cancelled, check that the new time slot is free
  if (nextStatus !== "Cancelled") {
    await assertSlotIsAvailable({
      appointmentId: appointment._id,
      doctorId: nextDoctorId,
      date: nextDate,
      time: nextTime
    });
  }

  // Save all the changes to the database
  const updatedAppointment = await appointment.save();

  res.status(200).json(serializeAppointment(updatedAppointment));
});

// Delete an appointment - only staff can do this, not patients
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Prevent patients from deleting appointments
  if (req.user.role === "patient") {
    res.status(403);
    throw new Error("Patients cannot delete appointments");
  }

  // Delete the appointment from the database
  await appointment.deleteOne();

  res.status(200).json({ message: "Appointment deleted successfully" });
});

// Export all the functions so the routes can use them
module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};

