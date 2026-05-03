// This file creates special tokens for user authentication.
// These tokens prove that a user is logged in and allow them to access protected parts of the app.

const jwt = require("jsonwebtoken");

// This function creates a JWT (JSON Web Token) for a user.
// The token includes the user's ID and role, and expires after 7 days.
const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

module.exports = generateToken;
