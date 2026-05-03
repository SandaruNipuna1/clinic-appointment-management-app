const User = require("../models/User");
const Patient = require("../models/Patient");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const generateEntityCode = require("../utils/generateEntityCode");
const { hashPassword, verifyPassword } = require("../utils/passwordUtils");
const { normalizeText, parseDateOnly } = require("../utils/clinicRecordHelpers");

// Convert a user record into a smaller object we can send back to the client
const serializeUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role
});

// Handle user sign up
const signup = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const role = req.body.role || "patient";

  if (role === "patient") {
    const existingPatient = await Patient.findOne({ email: normalizedEmail });

    if (existingPatient) {
      res.status(400);
      throw new Error("A patient with this email already exists");
    }
  }

  const user = await User.create({
    fullName: req.body.fullName.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(req.body.password),
    role
  });

  if (role === "patient") {
    try {
      await Patient.create({
        userId: user._id,
        name: req.body.fullName.trim(),
        dateOfBirth: parseDateOnly(req.body.dateOfBirth, "dateOfBirth"),
        gender: req.body.gender.trim(),
        phone: req.body.phone.trim(),
        email: normalizedEmail,
        address: req.body.address.trim(),
        patientCode: await generateEntityCode(Patient, "patientCode", "PAT")
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  // Return a token and the user info after signup
  res.status(201).json({
    token: generateToken(user),
    user: serializeUser(user)
  });
});

// Handle user login
const login = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error("No account found for this email");
  }

  if (!verifyPassword(req.body.password, user.passwordHash)) {
    res.status(401);
    throw new Error("Incorrect password");
  }

  // Return a token and the user info after login
  res.status(200).json({
    token: generateToken(user),
    user: serializeUser(user)
  });
});

// Return the current user's profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(serializeUser(user));
});

// Update the current user's profile and password
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const previousEmail = user.email;
  const previousFullName = user.fullName;

  if (req.body.email) {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      res.status(400);
      throw new Error("Another account already uses this email");
    }

    user.email = normalizedEmail;
  }

  if (req.body.fullName) {
    user.fullName = req.body.fullName.trim();
  }

  const wantsPasswordChange = Boolean(req.body.currentPassword?.trim() || req.body.newPassword?.trim());

  if (wantsPasswordChange) {
    if (!req.body.currentPassword?.trim()) {
      res.status(400);
      throw new Error("Current password is required");
    }

    if (!verifyPassword(req.body.currentPassword.trim(), user.passwordHash)) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    if (!req.body.newPassword?.trim() || req.body.newPassword.trim().length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    user.passwordHash = hashPassword(req.body.newPassword.trim());
  }

  let patientToSync = null;

  if (user.role === "patient") {
    patientToSync = await Patient.findOne({
      isActive: true,
      $or: [{ userId: user._id }, { email: normalizeText(previousEmail) }]
    });

    if (patientToSync) {
      if (req.body.email && normalizeText(patientToSync.email) !== normalizeText(user.email)) {
        const existingPatient = await Patient.findOne({
          email: normalizeText(user.email),
          _id: { $ne: patientToSync._id }
        });

        if (existingPatient) {
          res.status(400);
          throw new Error("Another patient profile already uses this email");
        }
      }
    }
  }

  await user.save();

  if (patientToSync) {
    if (req.body.email) {
      patientToSync.email = normalizeText(user.email);
    }

    patientToSync.userId = user._id;
    patientToSync.name = user.fullName || previousFullName;
    await patientToSync.save();
  }

  res.status(200).json({
    token: generateToken(user),
    user: serializeUser(user)
  });
});

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile
};
