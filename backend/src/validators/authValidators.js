const { body } = require("express-validator");

<<<<<<< HEAD
const SIGNUP_ROLE_OPTIONS = ["receptionist", "patient"];
=======
const SIGNUP_ROLE_OPTIONS = ["admin", "receptionist"];
>>>>>>> 4a883649 (patient management module added)

const signupValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").notEmpty().withMessage("Email is required").bail().isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
<<<<<<< HEAD
  body("role").isIn(SIGNUP_ROLE_OPTIONS).withMessage("Role must be receptionist or patient")
=======
  body("role").isIn(SIGNUP_ROLE_OPTIONS).withMessage("Role must be admin or receptionist")
>>>>>>> 4a883649 (patient management module added)
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
