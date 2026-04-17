const { body } = require("express-validator");

const ROLE_OPTIONS = ["admin", "receptionist", "patient"];

const signupValidation = [
  body("fullName").trim().notEmpty().withMessage("fullName is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
  body("role").isIn(ROLE_OPTIONS).withMessage("role must be admin, receptionist, or patient")
];

const loginValidation = [
  body("email").isEmail().withMessage("email must be valid"),
  body("password").notEmpty().withMessage("password is required")
];

const updateProfileValidation = [
  body("fullName").optional().trim().notEmpty().withMessage("fullName cannot be empty"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("password").optional().isLength({ min: 6 }).withMessage("password must be at least 6 characters")
];

module.exports = {
  signupValidation,
  loginValidation,
  updateProfileValidation
};
