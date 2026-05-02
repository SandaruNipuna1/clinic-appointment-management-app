const express = require("express");

const { login, signup, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { signupValidation, loginValidation, updateProfileValidation } = require("../validators/authValidators");

const router = express.Router();

router.post("/signup", signupValidation, validateRequest, signup);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfileValidation, validateRequest, updateProfile);

module.exports = router;
