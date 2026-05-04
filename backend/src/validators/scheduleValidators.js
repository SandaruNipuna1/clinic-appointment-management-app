// This file contains validation rules for schedule-related API requests.
// It uses express-validator to check that incoming data meets the required format and constraints.

const { body, param } = require("express-validator");
const mongoose = require("mongoose");

// Regular expression pattern for 24-hour time format (HH:MM)
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Helper function to check if a string is a valid MongoDB ObjectId
const  isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Helper function to validate time format for any field
const validateTime = (fieldName) =>
  body(fieldName).custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error(`${fieldName} must use HH:MM 24-hour format`);
    }
    return true;
  });

// Validation for schedule ID parameter in URL
const scheduleIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Schedule id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

// Validation rules for creating a new schedule
const createScheduleValidation = [
  body("doctorName").trim().notEmpty().withMessage("doctor name is required"),
  body("doctorId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("doctorId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("availableDays").custom((value) => {
    if (!Array.isArray(value) || value.length === 0) {
      throw new Error("at least one available day is required");
    }
    return true;
  }),
  validateTime("startTime"),
  validateTime("endTime"),
  body("status").optional().isIn(["Available", "Unavailable"]).withMessage("status must be valid")
];

// Validation rules for updating an existing schedule
const updateScheduleValidation = [
  ...scheduleIdParamValidation,
  body("doctorName").optional().trim().notEmpty().withMessage("doctor name cannot be empty"),
  body("doctorId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("doctorId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("availableDays")
    .optional()
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error("at least one available day is required");
      }
      return true;
    }),
  body("startTime")
    .optional()
    .custom((value) => {
      if (!TIME_PATTERN.test(value)) {
        throw new Error("startTime must use HH:MM 24-hour format");
      }
      return true;
    }),
  body("endTime")
    .optional()
    .custom((value) => {
      if (!TIME_PATTERN.test(value)) {
        throw new Error("endTime must use HH:MM 24-hour format");
      }
      return true;
    }),
  body("status").optional().isIn(["Available", "Unavailable"]).withMessage("status must be valid")
];

module.exports = {
  scheduleIdParamValidation,
  createScheduleValidation,
  updateScheduleValidation
};
