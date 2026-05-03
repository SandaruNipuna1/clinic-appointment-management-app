// This file defines the API routes for authentication-related operations.
// It sets up endpoints for user login, signup, and profile management with proper validation.

const express = require("express");

const { login, signup, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { signupValidation, loginValidation, updateProfileValidation } = require("../validators/authValidators");

const router = express.Router();

// User signup (no authentication required)
router.post("/signup", signupValidation, validateRequest, signup);

// User login (no authentication required)
router.post("/login", loginValidation, validateRequest, login);

// Get current user's profile (requires authentication)
router.get("/me", protect, getProfile);

// Update current user's profile (requires authentication)
router.patch("/me", protect, updateProfileValidation, validateRequest, updateProfile);

module.exports = router;
