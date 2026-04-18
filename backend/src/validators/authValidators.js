const { body } = require("express-validator");

const SIGNUP_ROLE_OPTIONS = ["receptionist", "patient"];

const signupValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").isIn(SIGNUP_ROLE_OPTIONS).withMessage("Role must be receptionist or patient")
];

const loginValidation = [
  body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required")
];

const updateProfileValidation = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

module.exports = {
  signupValidation,
  loginValidation,
  updateProfileValidation
};
