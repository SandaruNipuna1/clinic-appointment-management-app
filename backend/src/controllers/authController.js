const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const { hashPassword, verifyPassword } = require("../utils/passwordUtils");

const serializeUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role
});

const signup = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const user = await User.create({
    fullName: req.body.fullName.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(req.body.password),
    role: req.body.role
  });

  res.status(201).json({
    token: generateToken(user),
    user: serializeUser(user)
  });
});

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

  res.status(200).json({
    token: generateToken(user),
    user: serializeUser(user)
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(serializeUser(user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

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

  await user.save();

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
