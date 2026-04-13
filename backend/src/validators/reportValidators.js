const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const reportIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Report id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const patientIdParamValidation = [
  param("patientId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Patient id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const createReportValidation = [
  body("medicalRecordId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("medicalRecordId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  body("patientDetails.name")
    .trim()
    .notEmpty()
    .withMessage("patientDetails.name is required"),
  body("patientDetails.age").optional().isInt({ min: 0 }).withMessage("age must be a positive number"),
  body("patientDetails.gender").optional().trim(),
  body("patientDetails.contactNumber").optional().trim(),
  body("appointmentDetails.appointmentId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("appointmentDetails.appointmentId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  body("appointmentDetails.appointmentDate")
    .optional()
    .isISO8601()
    .withMessage("appointment date must be a valid date"),
  body("appointmentDetails.doctorName").optional().trim(),
  body("appointmentDetails.appointmentStatus").optional().trim()
];

module.exports = {
  reportIdParamValidation,
  patientIdParamValidation,
  createReportValidation
};
