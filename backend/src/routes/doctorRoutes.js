// This file defines the API routes for doctor-related operations.
// It sets up endpoints for CRUD operations on doctor records with proper authentication and validation.

const express = require("express");

const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController");
const { protect, adminOrReceptionist, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  doctorIdParamValidation,
  createDoctorValidation,
  updateDoctorValidation
} = require("../validators/doctorValidators");

const router = express.Router();

// Get all doctors (requires authentication)
router.get("/", protect, getAllDoctors);

// Get a specific doctor by ID (requires authentication and valid ID)
router.get("/:id", protect, doctorIdParamValidation, validateRequest, getDoctorById);

// Create a new doctor (requires admin or receptionist role)
router.post("/", protect, adminOrReceptionist, createDoctorValidation, validateRequest, createDoctor);

// Update an existing doctor (requires admin or receptionist role)
router.put("/:id", protect, adminOrReceptionist, updateDoctorValidation, validateRequest, updateDoctor);

// Delete a doctor (requires admin role only)
router.delete("/:id", protect, adminOnly, doctorIdParamValidation, validateRequest, deleteDoctor);

module.exports = router;
