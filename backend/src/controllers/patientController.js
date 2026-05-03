// This controller handles all operations related to patient records.
// It provides functions to create, read, update, and delete patient information.
// Patients are soft-deleted by setting isActive to false instead of removing them.

const Patient = require("../models/Patient");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");

const normalizeText = (value) => String(value || "").trim().toLowerCase();

// Get all active patients, sorted by name
const getAllPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({ isActive: true }).sort({ name: 1 });
  const staffAccounts = await User.find({
    role: { $ne: "patient" }
  })
    .select("_id fullName email")
    .lean();
  const staffUserIds = new Set(staffAccounts.map((user) => user._id.toString()));
  const staffEmails = new Set(staffAccounts.map((user) => normalizeText(user.email)));
  const staffNames = new Set(staffAccounts.map((user) => normalizeText(user.fullName)));

  res.status(200).json(
    patients.filter((patient) => {
      const linkedUserId = patient.userId?.toString();

      return (
        !staffUserIds.has(linkedUserId) &&
        !staffEmails.has(normalizeText(patient.email)) &&
        !staffNames.has(normalizeText(patient.name))
      );
    })
  );
});

// Get a specific patient by their ID (only if active)
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ _id: req.params.id, isActive: true });

  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  res.status(200).json(patient);
});

// Create a new patient record with validation
const createPatient = asyncHandler(async (req, res) => {
  // Normalize email to lowercase and check for duplicates
  const normalizedEmail = req.body.email.toLowerCase().trim();
  const existingPatient = await Patient.findOne({ email: normalizedEmail });

  if (existingPatient) {
    res.status(400);
    throw new Error("A patient with this email already exists");
  }

  // Create patient with generated code and normalized data
  const patient = await Patient.create({
    ...req.body,
    dateOfBirth: new Date(`${req.body.dateOfBirth}T00:00:00.000Z`),
    email: normalizedEmail,
    patientCode: await generateEntityCode(Patient, "patientCode", "PAT")
  });

  res.status(201).json(patient);
});

// Update an existing patient's information
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient || !patient.isActive) {
    res.status(404);
    throw new Error("Patient not found");
  }

  // Check for email conflicts if email is being updated
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

  // Convert date of birth to proper format if provided
  if (req.body.dateOfBirth) {
    req.body.dateOfBirth = new Date(`${req.body.dateOfBirth}T00:00:00.000Z`);
  }

  // Update and save the patient
  Object.assign(patient, req.body);
  const updatedPatient = await patient.save();

  res.status(200).json(updatedPatient);
});

// Soft delete a patient (mark as inactive)
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
