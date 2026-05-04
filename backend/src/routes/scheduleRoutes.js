// This file defines the API routes for schedule-related operations.
// It sets up endpoints for managing doctor availability schedules with proper authentication and validation.

const express = require("express");

const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} =  require("../controllers/scheduleController");
const { protect, adminOrReceptionist } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  scheduleIdParamValidation,
  createScheduleValidation,
  updateScheduleValidation
} = require("../validators/scheduleValidators");

const router = express.Router();

// Get all schedules (requires authentication)
router.get("/", protect, getAllSchedules);

// Get a specific schedule by ID (requires authentication)
router.get("/:id", protect, scheduleIdParamValidation, validateRequest, getScheduleById);

// Create a new schedule (requires admin or receptionist role)
router.post("/", protect, adminOrReceptionist, createScheduleValidation, validateRequest, createSchedule);

// Update an existing schedule (requires admin or receptionist role)
router.put("/:id", protect, adminOrReceptionist, updateScheduleValidation, validateRequest, updateSchedule);

// Delete a schedule (requires admin or receptionist role)
router.delete("/:id", protect, adminOrReceptionist, scheduleIdParamValidation, validateRequest, deleteSchedule);

module.exports = router;
