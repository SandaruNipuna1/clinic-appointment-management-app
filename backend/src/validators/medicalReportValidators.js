const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const medicalReportIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Medical report id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const createMedicalReportValidation = [
  body("patientName").trim().notEmpty().withMessage("patientName is required"),
  body("doctorName").trim().notEmpty().withMessage("doctorName is required"),
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
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("patientId must be a valid MongoDB ObjectId");
      }
      return true;
    })
];

const updateMedicalReportValidation = [
  ...medicalReportIdParamValidation,
  body("patientName").optional().trim().notEmpty().withMessage("patientName cannot be empty"),
  body("doctorName").optional().trim().notEmpty().withMessage("doctorName cannot be empty"),
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
