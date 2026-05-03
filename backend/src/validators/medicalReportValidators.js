// This file contains validation rules for medical report-related API requests.
// It uses express-validator to check that incoming data meets the required format and constraints.

const { body, param } = require("express-validator");
const mongoose = require("mongoose");

// Regular expression pattern for date format (YYYY-MM-DD)
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Validation for medical report ID parameter in URL
const medicalReportIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Medical report id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

// Validation rules for creating a new medical report
const createMedicalReportValidation = [
  body("patientName").trim().notEmpty().withMessage("patientName is required"),
  body("doctorName").trim().notEmpty().withMessage("doctorName is required"),
  body("doctorId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("doctorId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  body("diagnosis").trim().notEmpty().withMessage("diagnosis is required"),
  body("symptoms").trim().notEmpty().withMessage("symptoms is required"),
  body("treatment").trim().notEmpty().withMessage("treatment is required"),
  body("prescriptionNote").trim().notEmpty().withMessage("prescriptionNote is required"),
  body("reportDate").custom((value) => {
    if (!DATE_PATTERN.test(value)) {
      throw new Error("reportDate must use YYYY-MM-DD format");
    }
    return true;
  }),
  body("additionalNotes").optional().trim(),
  body("patientId")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("patientId must be a valid MongoDB ObjectId");
      }
      return true;
    })
];

// Validation rules for updating an existing medical report
const updateMedicalReportValidation = [
  ...medicalReportIdParamValidation,
  body("patientName").optional().trim().notEmpty().withMessage("patientName cannot be empty"),
  body("doctorName").optional().trim().notEmpty().withMessage("doctorName cannot be empty"),
  body("doctorId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("doctorId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("diagnosis").optional().trim().notEmpty().withMessage("diagnosis cannot be empty"),
  body("symptoms").optional().trim().notEmpty().withMessage("symptoms cannot be empty"),
  body("treatment").optional().trim().notEmpty().withMessage("treatment cannot be empty"),
  body("prescriptionNote").optional().trim().notEmpty().withMessage("prescriptionNote cannot be empty"),
  body("reportDate")
    .optional()
    .custom((value) => {
      if (!DATE_PATTERN.test(value)) {
        throw new Error("reportDate must use YYYY-MM-DD format");
      }
      return true;
    }),
  body("additionalNotes").optional().trim(),
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
  medicalReportIdParamValidation,
  createMedicalReportValidation,
  updateMedicalReportValidation
};
