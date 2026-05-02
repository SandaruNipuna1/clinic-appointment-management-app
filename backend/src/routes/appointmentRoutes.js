// Load the Express library so we can make routes for appointments
const express = require("express");

// Controller functions handle the actual logic for each route
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require("../controllers/appointmentController");

// Middleware to check if the user is logged in
const { protect } = require("../middleware/authMiddleware");
// Middleware to check if request data is valid
const validateRequest = require("../middleware/validateRequest");

// Rules for validating appointment IDs and appointment data
const {
  appointmentIdParamValidation,
  createAppointmentValidation,
  updateAppointmentValidation
} = require("../validators/appointmentValidators");

// Create a new router object where we define the appointment routes
const router = express.Router();

// Get all appointments (user must be logged in)
router.get("/", protect, getAppointments);

// Get a single appointment by its ID
router.get("/:id", protect, appointmentIdParamValidation, validateRequest, getAppointmentById);

// Create a new appointment with validation checks
router.post("/", protect, createAppointmentValidation, validateRequest, createAppointment);

// Update an existing appointment by ID with validation checks
router.put("/:id", protect, updateAppointmentValidation, validateRequest, updateAppointment);

// Delete an appointment by ID
router.delete("/:id", protect, appointmentIdParamValidation, validateRequest, deleteAppointment);

// Export this router so the main app can use it
module.exports = router;
