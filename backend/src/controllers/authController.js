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
    throw new Error("An account already exists for this email");
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

  if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
    res.status(401);
    throw new Error("Invalid email or password");
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

  if (req.body.password?.trim()) {
    user.passwordHash = hashPassword(req.body.password.trim());
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
