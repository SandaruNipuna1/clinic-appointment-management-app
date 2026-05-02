const store = require("../data/localStore");
const asyncHandler = require("../utils/asyncHandler");

const getAllPatients = asyncHandler(async (req, res) => {
  const patients = store.findPatients();
  res.status(200).json(patients);
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = store.findPatientById(req.params.id);

  if (!patient || !patient.isActive) {
    res.status(404);
    throw new Error("Patient not found");
  }

  res.status(200).json(patient);
});

const createPatient = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.toLowerCase().trim();
  const existingPatient = store.findPatients().find((patient) => patient.email === normalizedEmail);

  if (existingPatient) {
    res.status(400);
    throw new Error("A patient with this email already exists");
  }

  const patient = store.createPatient({
    ...req.body,
    email: normalizedEmail
  });

  res.status(201).json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = store.findPatientById(req.params.id);

  if (!patient || !patient.isActive) {
    res.status(404);
    throw new Error("Patient not found");
  }

  if (req.body.email) {
    const normalizedEmail = req.body.email.toLowerCase().trim();
    const existingPatient = store.findPatients().find((item) => item.email === normalizedEmail && item.id !== patient.id);

    if (existingPatient) {
      res.status(400);
      throw new Error("A patient with this email already exists");
    }

    req.body.email = normalizedEmail;
  }

  const updatedPatient = store.savePatient({
    ...patient,
    ...req.body,
    updatedAt: new Date()
  });

  res.status(200).json(updatedPatient);
});

const deletePatient = asyncHandler(async (req, res) => {
  const patient = store.findPatientById(req.params.id);

  if (!patient || !patient.isActive) {
    res.status(404);
    throw new Error("Patient not found");
  }

  store.deactivatePatient(patient.id);

  res.status(200).json({ message: "Patient removed successfully" });
});

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
