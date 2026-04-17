const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const doctorIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Doctor id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const doctorAvailabilityValidation = body("availability")
  .optional()
  .isArray()
  .withMessage("availability must be an array");

const doctorAvailabilityItemsValidation = body("availability.*.day")
  .optional()
  .trim()
  .notEmpty()
  .withMessage("availability day is required");

const doctorAvailabilityStartTimeValidation = body("availability.*.startTime")
  .optional()
  .custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error("availability startTime must use HH:MM 24-hour format");
    }
    return true;
  });

const doctorAvailabilityEndTimeValidation = body("availability.*.endTime")
  .optional()
  .custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error("availability endTime must use HH:MM 24-hour format");
    }
    return true;
  });

const createDoctorValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("specialization").trim().notEmpty().withMessage("specialization is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("phone").trim().notEmpty().withMessage("phone is required"),
  body("availabilityLabel").optional().trim(),
  body("roomNumber").optional().trim(),
  body("department").optional().trim(),
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

const updateDoctorValidation = [
  ...doctorIdParamValidation,
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("specialization").optional().trim().notEmpty().withMessage("specialization cannot be empty"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("phone").optional().trim().notEmpty().withMessage("phone cannot be empty"),
  body("availabilityLabel").optional().trim(),
  body("roomNumber").optional().trim(),
  body("department").optional().trim(),
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
