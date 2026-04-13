const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const objectIdMessage = (field) => `${field} must be a valid MongoDB ObjectId`;

const medicalRecordIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error(objectIdMessage("Medical record id"));
    }
    return true;
  })
];

const patientIdParamValidation = [
  param("patientId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error(objectIdMessage("Patient id"));
    }
    return true;
  })
];

const createMedicalRecordValidation = [
  body("patientId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error(objectIdMessage("patientId"));
    }
    return true;
  }),
  body("appointmentId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error(objectIdMessage("appointmentId"));
    }
    return true;
  }),
  body("doctorName").trim().notEmpty().withMessage("doctorName is required"),
  body("symptoms").trim().notEmpty().withMessage("symptoms is required"),
  body("diagnosis").trim().notEmpty().withMessage("diagnosis is required"),
  body("treatmentNotes").optional().trim(),
  body("visitDate").isISO8601().withMessage("visitDate must be a valid date"),
  body("status")
    .optional()
    .isIn(["active", "follow-up", "closed"])
    .withMessage("status must be active, follow-up, or closed")
];

const updateMedicalRecordValidation = [
  ...medicalRecordIdParamValidation,
  body("doctorName").optional().trim().notEmpty().withMessage("doctorName cannot be empty"),
  body("symptoms").optional().trim().notEmpty().withMessage("symptoms cannot be empty"),
  body("diagnosis").optional().trim().notEmpty().withMessage("diagnosis cannot be empty"),
  body("treatmentNotes").optional().trim(),
  body("visitDate").optional().isISO8601().withMessage("visitDate must be a valid date"),
  body("status")
    .optional()
    .isIn(["active", "follow-up", "closed"])
    .withMessage("status must be active, follow-up, or closed")
];

module.exports = {
  medicalRecordIdParamValidation,
  patientIdParamValidation,
  createMedicalRecordValidation,
  updateMedicalRecordValidation
};
