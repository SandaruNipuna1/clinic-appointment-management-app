// This file contains validation rules for doctor-related API requests.
// It uses express-validator to check that incoming data meets the required format and constraints.

const { body, param } = require("express-validator");
const mongoose = require("mongoose");

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

// Validation rules for creating a new doctor
const createDoctorValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("specialization").trim().notEmpty().withMessage("specialization is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("phone").trim().notEmpty().withMessage("phone is required"),
  body("roomNumber").optional().trim(),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("experience must be a non-negative number"),
  body("bio").optional().trim()
];

// Validation rules for updating an existing doctor
const updateDoctorValidation = [
  ...doctorIdParamValidation,
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("specialization").optional().trim().notEmpty().withMessage("specialization cannot be empty"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("phone").optional().trim().notEmpty().withMessage("phone cannot be empty"),
  body("roomNumber").optional().trim(),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("experience must be a non-negative number"),
  body("bio").optional().trim()
];

module.exports = {
  doctorIdParamValidation,
  createDoctorValidation,
  updateDoctorValidation
};
