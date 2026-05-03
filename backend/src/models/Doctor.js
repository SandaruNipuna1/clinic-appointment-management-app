// This file defines the structure for doctor information in the database.
// Doctors have personal details, specialization, availability, and contact information.

const mongoose = require("mongoose");

// Define the schema for doctor's availability (working hours)
const availabilitySchema = new mongoose.Schema(
  {
    // Day of the week (e.g., "Monday")
    day: {
      type: String,
      required: true,
      trim: true
    },
    // Start time (e.g., "09:00")
    startTime: {
      type: String,
      required: true
    },
    // End time (e.g., "17:00")
    endTime: {
      type: String,
      required: true
    }
  },
  {
    // Don't create separate IDs for availability entries
    _id: false
  }
);

// Define the main schema for doctors
const doctorSchema = new mongoose.Schema(
  {
    // Doctor's full name
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Medical specialization (e.g., "Cardiology")
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    // Email address (must be unique)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    // Phone number
    phone: {
      type: String,
      required: true,
      trim: true
    },
    // Unique code for the doctor
    doctorCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    // Years of experience
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    // Short biography
    bio: {
      type: String,
      trim: true,
      default: ""
    },
    // List of available time slots
    availability: {
      type: [availabilitySchema],
      default: []
    },
    // Pre-formatted availability text
    availabilityLabel: {
      type: String,
      trim: true,
      default: ""
    },
    // Room number in the clinic
    roomNumber: {
      type: String,
      trim: true,
      default: ""
    },
    // Department name
    department: {
      type: String,
      trim: true,
      default: ""
    },
    // Whether the doctor is currently active
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

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("Doctor", doctorSchema);
