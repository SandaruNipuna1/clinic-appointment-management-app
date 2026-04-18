const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");

const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json(patients);
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ _id: req.params.id, isActive: true });

  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  res.status(200).json(patient);
});

const createPatient = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.toLowerCase().trim();
  const existingPatient = await Patient.findOne({ email: normalizedEmail });

  if (existingPatient) {
    res.status(400);
    throw new Error("A patient with this email already exists");
  }

  const patient = await Patient.create({
    ...req.body,
    dateOfBirth: new Date(`${req.body.dateOfBirth}T00:00:00.000Z`),
    email: normalizedEmail,
    patientCode: await generateEntityCode(Patient, "patientCode", "PAT")
  });

  res.status(201).json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient || !patient.isActive) {
    res.status(404);
    throw new Error("Patient not found");
  }

  if (req.body.email) {
    const normalizedEmail = req.body.email.toLowerCase().trim();
    const existingPatient = await Patient.findOne({
      email: normalizedEmail,
      _id: { $ne: patient._id }
    });

    if (existingPatient) {
      res.status(400);
      throw new Error("A patient with this email already exists");
    }

    req.body.email = normalizedEmail;
  }

  if (req.body.dateOfBirth) {
    req.body.dateOfBirth = new Date(`${req.body.dateOfBirth}T00:00:00.000Z`);
  }

  Object.assign(patient, req.body);
  const updatedPatient = await patient.save();

  res.status(200).json(updatedPatient);
});

const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient || !patient.isActive) {
    res.status(404);
    throw new Error("Patient not found");
  }

  patient.isActive = false;
  await patient.save();

  res.status(200).json({ message: "Patient removed successfully" });
});

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
