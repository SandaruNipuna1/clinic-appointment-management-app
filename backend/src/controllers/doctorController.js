const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const MedicalReport = require("../models/MedicalReport");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");

const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ isActive: true }).sort({
    specialization: 1,
    name: 1
  });

  res.status(200).json(doctors);
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.status(200).json(doctor);
});

const createDoctor = asyncHandler(async (req, res) => {
  const existingDoctor = await Doctor.findOne({
    email: req.body.email.toLowerCase().trim()
  });

  if (existingDoctor) {
    res.status(400);
    throw new Error("A doctor with this email already exists");
  }

  const doctor = await Doctor.create({
    ...req.body,
    doctorCode: await generateEntityCode(Doctor, "doctorCode", "DOC"),
    email: req.body.email.toLowerCase().trim()
  });

  res.status(201).json(doctor);
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor || !doctor.isActive) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  if (req.body.email) {
    const normalizedEmail = req.body.email.toLowerCase().trim();
    const existingDoctor = await Doctor.findOne({
      email: normalizedEmail,
      _id: { $ne: doctor._id }
    });

    if (existingDoctor) {
      res.status(400);
      throw new Error("A doctor with this email already exists");
    }

    req.body.email = normalizedEmail;
  }

  Object.assign(doctor, req.body);
  const updatedDoctor = await doctor.save();

  res.status(200).json(updatedDoctor);
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor || !doctor.isActive) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const linkedAppointments = await Appointment.exists({ doctorId: doctor._id });

  if (linkedAppointments) {
    res.status(400);
    throw new Error("Doctor cannot be removed while appointments still reference this doctor");
  }

  const linkedReports = await MedicalReport.exists({ doctorName: doctor.name });

  if (linkedReports) {
    res.status(400);
    throw new Error("Doctor cannot be removed while medical reports still reference this doctor");
  }

  doctor.isActive = false;
  await doctor.save();

  res.status(200).json({ message: "Doctor removed successfully" });
});

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
