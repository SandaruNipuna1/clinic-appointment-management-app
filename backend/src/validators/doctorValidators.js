// This file contains validation rules for doctor-related API requests.
// It uses express-validator to check that incoming data meets the required format and constraints.

const { body, param } = require("express-validator");
const mongoose = require("mongoose");

// Regular expression pattern for 24-hour time format (HH:MM)
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Validation for doctor ID parameter in URL
const doctorIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Doctor id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

// Validation for availability array structure
const doctorAvailabilityValidation = body("availability")
  .optional()
  .isArray()
  .withMessage("availability must be an array");

// Validation for individual availability day entries
const doctorAvailabilityItemsValidation = body("availability.*.day")
  .optional()
  .trim()
  .notEmpty()
  .withMessage("availability day is required");

// Validation for availability start time format
const doctorAvailabilityStartTimeValidation = body("availability.*.startTime")
  .optional()
  .custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error("availability startTime must use HH:MM 24-hour format");
    }
    return true;
  });

// Validation for availability end time format
const doctorAvailabilityEndTimeValidation = body("availability.*.endTime")
  .optional()
  .custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error("availability endTime must use HH:MM 24-hour format");
    }
    return true;
  });

// Validation rules for creating a new doctor
const createDoctorValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("specialization").trim().notEmpty().withMessage("specialization is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("phone").trim().notEmpty().withMessage("phone is required"),
  body("availability").isArray({ min: 1 }).withMessage("availability is required"),
  body("roomNumber").optional().trim(),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("experience must be a non-negative number"),
  body("bio").optional().trim(),
  doctorAvailabilityValidation,
  doctorAvailabilityItemsValidation,
  doctorAvailabilityStartTimeValidation,
  doctorAvailabilityEndTimeValidation
];

// Validation rules for updating an existing doctor
const updateDoctorValidation = [
  ...doctorIdParamValidation,
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("specialization").optional().trim().notEmpty().withMessage("specialization cannot be empty"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("phone").optional().trim().notEmpty().withMessage("phone cannot be empty"),
  body("availability").optional().isArray({ min: 1 }).withMessage("availability must be a non-empty array"),
  body("roomNumber").optional().trim(),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("experience must be a non-negative number"),
  body("bio").optional().trim(),
  doctorAvailabilityValidation,
  doctorAvailabilityItemsValidation,
  doctorAvailabilityStartTimeValidation,
  doctorAvailabilityEndTimeValidation
];

module.exports = {
  doctorIdParamValidation,
  createDoctorValidation,
  updateDoctorValidation
};
