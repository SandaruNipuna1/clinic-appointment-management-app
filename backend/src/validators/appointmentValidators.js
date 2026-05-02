const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const appointmentIdParamValidation = [
  param("id").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("Appointment id must be a valid MongoDB ObjectId");
    }
    return true;
  })
];

const createAppointmentValidation = [
  body("patientName").trim().notEmpty().withMessage("patientName is required"),
  body("doctorId").custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error("doctorId must be a valid MongoDB ObjectId");
    }
    return true;
  }),
  body("date").custom((value) => {
    if (!DATE_PATTERN.test(value)) {
      throw new Error("date must use YYYY-MM-DD format");
    }
    return true;
  }),
  body("time").custom((value) => {
    if (!TIME_PATTERN.test(value)) {
      throw new Error("time must use HH:MM 24-hour format");
    }
    return true;
  }),
  body("reason").trim().notEmpty().withMessage("reason is required"),
  body("status").optional().isIn(STATUS_OPTIONS).withMessage("status must be Scheduled, Completed, or Cancelled"),
  body("patientId")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("patientId must be a valid MongoDB ObjectId");
      }
      return true;
    })
];

const updateAppointmentValidation = [
  ...appointmentIdParamValidation,
  body("patientName").optional().trim().notEmpty().withMessage("patientName cannot be empty"),
  body("doctorId")
    .optional()
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("doctorId must be a valid MongoDB ObjectId");
      }
      return true;
    }),
  body("date")
    .optional()
    .custom((value) => {
      if (!DATE_PATTERN.test(value)) {
        throw new Error("date must use YYYY-MM-DD format");
      }
      return true;
    }),
  body("time")
    .optional()
    .custom((value) => {
      if (!TIME_PATTERN.test(value)) {
        throw new Error("time must use HH:MM 24-hour format");
      }
      return true;
    }),
  body("reason").optional().trim().notEmpty().withMessage("reason cannot be empty"),
  body("status").optional().isIn(STATUS_OPTIONS).withMessage("status must be Scheduled, Completed, or Cancelled"),
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
  appointmentIdParamValidation,
  createAppointmentValidation,
  updateAppointmentValidation
};
