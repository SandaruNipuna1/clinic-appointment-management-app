const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");

const serializeAppointment = (appointment) => ({
  ...(typeof appointment.toObject === "function" ? appointment.toObject() : appointment),
  date: appointment.date
});

const findConflictingAppointment = ({ appointmentId, doctorId, date, time }) =>
  Appointment.findOne({
    ...(appointmentId ? { _id: { $ne: appointmentId } } : {}),
    doctorId,
    date,
    time,
    status: { $ne: "Cancelled" }
  }).lean();

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

const getPatientAppointmentQuery = async (user) => {
  const linkedPatients = user.email
    ? await Patient.find({ email: user.email.trim().toLowerCase() }).select("_id").lean()
    : [];
  const linkedPatientIds = linkedPatients.map((patient) => patient._id);

  return {
    $or: [{ patientId: user.id }, ...(linkedPatientIds.length > 0 ? [{ patientId: { $in: linkedPatientIds } }] : [])]
  };
};

const canPatientAccessAppointment = async (appointmentId, user) => {
  const query = await getPatientAppointmentQuery(user);

  return Appointment.exists({
    _id: appointmentId,
    ...query
  });
};

const getAppointments = asyncHandler(async (req, res) => {
  const query = req.user.role === "patient" ? await getPatientAppointmentQuery(req.user) : {};
  const appointments = await Appointment.find(query)
    .sort({ date: -1, time: -1 })
    .lean();

  res.status(200).json(appointments);
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (req.user.role === "patient") {
    const canAccessAppointment = await canPatientAccessAppointment(appointment._id, req.user);

    if (!canAccessAppointment) {
      res.status(403);
      throw new Error("Access denied");
    }
  }

  res.status(200).json(appointment);
});

const createAppointment = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({
    _id: req.body.doctorId,
    isActive: true
  });

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const appointmentDate = new Date(`${req.body.date}T00:00:00.000Z`);

  await assertSlotIsAvailable({
    doctorId: doctor._id,
    date: appointmentDate,
    time: req.body.time
  });

  const isPatient = req.user.role === "patient";

  const appointment = await Appointment.create({
    appointmentCode: await generateEntityCode(Appointment, "appointmentCode", "APT"),
    patientId: isPatient ? req.user.id : req.body.patientId || null,
    patientName: isPatient ? req.user.fullName : req.body.patientName.trim(),
    doctorId: doctor._id,
    doctorName: doctor.name,
    date: appointmentDate,
    time: req.body.time,
    reason: req.body.reason.trim(),
    status: "Scheduled"
  });

  res.status(201).json(serializeAppointment(appointment));
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const isPatient = req.user.role === "patient";

  if (isPatient) {
    const canAccessAppointment = await canPatientAccessAppointment(appointment._id, req.user);

    if (!canAccessAppointment) {
      res.status(403);
      throw new Error("Access denied");
    }
  }

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

  let nextDoctorId = appointment.doctorId;
  let nextDate = appointment.date;
  let nextTime = appointment.time;
  const nextStatus = req.body.status || appointment.status;

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

  if (req.body.patientId !== undefined) {
    appointment.patientId = req.body.patientId || null;
  }

  if (req.body.patientName) {
    appointment.patientName = req.body.patientName.trim();
  }

  if (req.body.date) {
    nextDate = new Date(`${req.body.date}T00:00:00.000Z`);
    appointment.date = nextDate;
  }

  if (req.body.time) {
    nextTime = req.body.time;
    appointment.time = req.body.time;
  }

  if (req.body.reason) {
    appointment.reason = req.body.reason.trim();
  }

  if (req.body.status) {
    appointment.status = req.body.status;
  }

  if (nextStatus !== "Cancelled") {
    await assertSlotIsAvailable({
      appointmentId: appointment._id,
      doctorId: nextDoctorId,
      date: nextDate,
      time: nextTime
    });
  }

  const updatedAppointment = await appointment.save();

  res.status(200).json(serializeAppointment(updatedAppointment));
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (req.user.role === "patient") {
    res.status(403);
    throw new Error("Patients cannot delete appointments");
  }

  await appointment.deleteOne();

  res.status(200).json({ message: "Appointment deleted successfully" });
});

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
