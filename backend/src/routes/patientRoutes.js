// This file defines the API routes for patient-related operations.
// It sets up endpoints for CRUD operations on patient records with proper authentication and validation.
// All patient operations require admin or receptionist role.

const express = require("express");

const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require("../controllers/patientController");
const { protect, adminOrReceptionist } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  patientIdParamValidation,
  createPatientValidation,
  updatePatientValidation
} = require("../validators/patientValidators");

const router = express.Router();

// Get all patients (requires admin or receptionist role)
router.get("/", protect, adminOrReceptionist, getAllPatients);

// Get a specific patient by ID (requires admin or receptionist role)
router.get("/:id", protect, adminOrReceptionist, patientIdParamValidation, validateRequest, getPatientById);

// Create a new patient (requires admin or receptionist role)
router.post("/", protect, adminOrReceptionist, createPatientValidation, validateRequest, createPatient);

// Update an existing patient (requires admin or receptionist role)
router.put("/:id", protect, adminOrReceptionist, updatePatientValidation, validateRequest, updatePatient);

// Delete a patient (requires admin or receptionist role)
router.delete("/:id", protect, adminOrReceptionist, patientIdParamValidation, validateRequest, deletePatient);

module.exports = router;
