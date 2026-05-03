// This file contains validation rules for patient-related API requests.
// It uses express-validator to check that incoming data meets the required format and constraints.

const { body, param } = require("express-validator");
const mongoose = require("mongoose");

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
// Regular expression pattern for date format (YYYY-MM-DD)
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Validation for patient ID parameter in URL
const patientIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Patient id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

// Validation rules for creating a new patient
const createPatientValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("dateOfBirth").custom((value) => {
    if (!DATE_PATTERN.test(value)) {
      throw new Error("dateOfBirth must use YYYY-MM-DD format");
    }
    return true;
  }),
  body("gender").trim().notEmpty().withMessage("gender is required"),
  body("phone").trim().notEmpty().withMessage("phone is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("address").trim().notEmpty().withMessage("address is required")
];

// Validation rules for updating an existing patient
const updatePatientValidation = [
  ...patientIdParamValidation,
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("dateOfBirth")
    .optional()
    .custom((value) => {
      if (!DATE_PATTERN.test(value)) {
        throw new Error("dateOfBirth must use YYYY-MM-DD format");
      }
      return true;
    }),
  body("gender").optional().trim().notEmpty().withMessage("gender cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("phone cannot be empty"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("address").optional().trim().notEmpty().withMessage("address cannot be empty")
];

module.exports = {
  patientIdParamValidation,
  createPatientValidation,
  updatePatientValidation
};
