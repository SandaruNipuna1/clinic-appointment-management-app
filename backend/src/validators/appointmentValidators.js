const { body, param } = require("express-validator");
const mongoose = require("mongoose");

// Patterns to check date and time text
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

// Helper to check if a value is a valid MongoDB ID
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Validate the appointment ID in the URL path
const appointmentIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Appointment id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

// Rules for creating a new appointment
const createAppointmentValidation = [
  // Patient name must be provided
  body("patientName").trim().notEmpty().withMessage("patientName is required"),
  // Doctor ID must be a real MongoDB object id
  body("doctorId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("doctorId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  // Date must be in YYYY-MM-DD format
  body("date").custom((value) => {
    if (!DATE_PATTERN.test(value)) {
      throw new Error("date must use YYYY-MM-DD format");
    }
    return true;
  }),
  // Time must be in 24-hour HH:MM format
  body("time").custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error("time must use HH:MM 24-hour format");
    }
    return true;
  }),
  // Reason must be provided
  body("reason").trim().notEmpty().withMessage("reason is required"),
  // Status is optional, but if provided it must be one of the allowed values
  body("status").optional().isIn(STATUS_OPTIONS).withMessage("status must be Scheduled, Completed, or Cancelled"),
  // Patient ID is optional, but if present it must be a valid object id
  body("patientId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("patientId must be a valid MongoDB ObjectId");
      }
      return true;
    })
];

// Rules for updating an appointment
const updateAppointmentValidation = [
  ...appointmentIdParamValidation,
  // Patient name can be updated, but not set to empty
  body("patientName").optional().trim().notEmpty().withMessage("patientName cannot be empty"),
  // Doctor ID can be changed, but must still be valid
  body("doctorId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("doctorId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  // Date can be updated, but must follow the same format
  body("date")
    .optional()
    .custom((value) => {
      if (!DATE_PATTERN.test(value)) {
        throw new Error("date must use YYYY-MM-DD format");
      }
      return true;
    }),
  // Time can be updated, but must use the same format
  body("time")
    .optional()
    .custom((value) => {
      if (!TIME_PATTERN.test(value)) {
        throw new Error("time must use HH:MM 24-hour format");
      }
      return true;
    }),
  // Reason can be updated, but not emptied out
  body("reason").optional().trim().notEmpty().withMessage("reason cannot be empty"),
  // Status can be updated if it's one of the allowed options
  body("status").optional().isIn(STATUS_OPTIONS).withMessage("status must be Scheduled, Completed, or Cancelled"),
  // Patient ID can be updated but must still be a valid id when provided
  body("patientId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("patientId must be a valid MongoDB ObjectId");
      }
      return true;
    })
];

module.exports = {
  appointmentIdParamValidation,
  createAppointmentValidation,
  updateAppointmentValidation
};
