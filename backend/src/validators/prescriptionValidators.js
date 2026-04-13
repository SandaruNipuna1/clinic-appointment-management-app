const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const prescriptionIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Prescription id must be a valid MongoDB ObjectId");
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

const medicineValidationRules = [
  body("medicines").isArray({ min: 1 }).withMessage("medicines must be a non-empty array"),
  body("medicines.*.medicineName").trim().notEmpty().withMessage("medicineName is required"),
  body("medicines.*.dosage").trim().notEmpty().withMessage("dosage is required"),
  body("medicines.*.frequency").trim().notEmpty().withMessage("frequency is required"),
  body("medicines.*.duration").trim().notEmpty().withMessage("duration is required"),
  body("medicines.*.instructions").optional().trim()
];

const createPrescriptionValidation = [
  body("medicalRecordId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("medicalRecordId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  body("patientId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("patientId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  ...medicineValidationRules,
  body("prescribedDate")
    .isISO8601()
    .withMessage("prescribedDate must be a valid date")
];

const updatePrescriptionValidation = [
  ...prescriptionIdParamValidation,
  body("medicalRecordId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("medicalRecordId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("patientId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("patientId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("prescribedDate")
    .optional()
    .isISO8601()
    .withMessage("prescribedDate must be a valid date"),
  body("medicines")
    .optional()
    .isArray({ min: 1 })
    .withMessage("medicines must be a non-empty array"),
  body("medicines.*.medicineName").optional().trim().notEmpty(),
  body("medicines.*.dosage").optional().trim().notEmpty(),
  body("medicines.*.frequency").optional().trim().notEmpty(),
  body("medicines.*.duration").optional().trim().notEmpty(),
  body("medicines.*.instructions").optional().trim()
];

module.exports = {
  prescriptionIdParamValidation,
  patientIdParamValidation,
  createPrescriptionValidation,
  updatePrescriptionValidation
};
