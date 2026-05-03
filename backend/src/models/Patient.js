// This file defines the structure for patient information in the database.
// Patients have personal details, contact information, and medical history tracking.

const mongoose = require("mongoose");

// Define the schema for patients
const patientSchema = new mongoose.Schema(
  {
    // Unique code for the patient
    patientCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    // Patient's full name
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Date of birth
    dateOfBirth: {
      type: Date,
      required: true,
    },
    // Gender (e.g., "Male", "Female", "Other")
    gender: {
      type: String,
      required: true,
      trim: true
    },
    // Phone number
    phone: {
      type: String,
      required: true,
      trim: true
    },
    // Email address (must be unique)
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },
    // Home address
    address: {
      type: String,
      required: true,
      trim: true
    },
    // Whether the patient is currently active
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Create index for faster searches by name
patientSchema.index({ name: 1 });

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("Patient", patientSchema);
