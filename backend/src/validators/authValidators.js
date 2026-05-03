const { body } = require("express-validator");

// Only patients are allowed to sign up through this route
const SIGNUP_ROLE_OPTIONS = ["patient"];

// Rules for sign up requests
const signupValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(SIGNUP_ROLE_OPTIONS).withMessage("Role must be patient")
];

// Rules for login requests
const loginValidation = [
  body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required")
];

// Rules for profile update requests
const updateProfileValidation = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("currentPassword").optional().trim(),
  body("newPassword").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

module.exports = {
  signupValidation,
  loginValidation,
  updateProfileValidation
};
