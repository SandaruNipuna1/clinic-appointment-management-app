// This file defines the structure for user accounts in the database.
// Users can be patients, receptionists, or admins with different access levels.

const mongoose = require("mongoose");

// Define the schema for users
const userSchema = new mongoose.Schema(
  {
    // User's full name
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    // Email address (must be unique, used for login)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    // Hashed password for security
    passwordHash: {
      type: String,
      required: true
    },
    // User role determines what they can access
    role: {
      type: String,
      enum: ["admin", "receptionist", "patient"],
      default: "patient"
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("User", userSchema);
