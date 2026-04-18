const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const patientIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Patient id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const createPatientValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("age").isInt({ min: 0 }).withMessage("age must be a non-negative number"),
  body("gender").trim().notEmpty().withMessage("gender is required"),
  body("phone").trim().notEmpty().withMessage("phone is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("address").trim().notEmpty().withMessage("address is required")
];

const updatePatientValidation = [
  ...patientIdParamValidation,
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("age").optional().isInt({ min: 0 }).withMessage("age must be a non-negative number"),
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
