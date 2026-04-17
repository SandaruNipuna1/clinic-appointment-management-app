const jwt = require("jsonwebtoken");

const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Admin only");
  }

  next();
};

const adminOrReceptionist = (req, res, next) => {
  if (!req.user || !["admin", "receptionist"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Access denied. Admin or receptionist only");
  }

  next();
};

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
  patientOnly
};
