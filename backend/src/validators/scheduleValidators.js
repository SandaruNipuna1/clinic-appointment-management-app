const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateTime = (fieldName) =>
  body(fieldName).custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error(`${fieldName} must use HH:MM 24-hour format`);
    }
    return true;
  });

const scheduleIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Schedule id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const createScheduleValidation = [
  body("doctorName").trim().notEmpty().withMessage("doctor name is required"),
  body("availableDay").trim().notEmpty().withMessage("available day is required"),
  validateTime("startTime"),
  validateTime("endTime"),
  body("status").optional().isIn(["Available", "Unavailable"]).withMessage("status must be valid")
];

const updateScheduleValidation = [
  ...scheduleIdParamValidation,
  body("doctorName").optional().trim().notEmpty().withMessage("doctor name cannot be empty"),
  body("availableDay").optional().trim().notEmpty().withMessage("available day cannot be empty"),
  body("startTime")
    .optional()
    .custom((value) => {
      if (!TIME_PATTERN.test(value)) {
        throw new Error("startTime must use HH:MM 24-hour format");
      }
      return true;
    }),
  body("endTime")
    .optional()
    .custom((value) => {
      if (!TIME_PATTERN.test(value)) {
        throw new Error("endTime must use HH:MM 24-hour format");
      }
      return true;
    }),
  body("status").optional().isIn(["Available", "Unavailable"]).withMessage("status must be valid")
];

module.exports = {
  scheduleIdParamValidation,
  createScheduleValidation,
  updateScheduleValidation
};
