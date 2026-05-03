// This file controls who can use the backend routes.
// It checks the user's login token and their role before letting the request continue.
const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");

// This middleware checks the login token and loads the user info.
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require("../models/User");
    const user = await User.findById(decoded.id).select("fullName email role");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    // Save a small user object on the request for later middleware or route handlers
    req.user = {
      id: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      email: user.email
    };

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }
});

// Only allow admin users
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Admin only");
  }

  next();
};

// Allow either admin or receptionist users
const adminOrReceptionist = (req, res, next) => {
  if (!req.user || !["admin", "receptionist"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Access denied. Admin or receptionist only");
  }

  next();
};

// Allow admin, receptionist, or patient users
const reportViewer = (req, res, next) => {
  if (!req.user || !["admin", "receptionist", "patient"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Access denied. Admin, receptionist, or patient only");
  }

  next();
};

// Only allow patient users
const patientOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "patient") {
    res.status(403);
    throw new Error("Access denied. Patient only");
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  adminOrReceptionist,
  reportViewer,
  patientOnly
};
