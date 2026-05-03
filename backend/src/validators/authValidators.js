const { body } = require("express-validator");

// Only patients are allowed to sign up through this route
const SIGNUP_ROLE_OPTIONS = ["patient"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  body("dateOfBirth").custom((value) => {
    if (!DATE_PATTERN.test(value || "")) {
      throw new Error("dateOfBirth must use YYYY-MM-DD format");
    }
    return true;
  }),
  body("gender").trim().notEmpty().withMessage("Gender is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
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
