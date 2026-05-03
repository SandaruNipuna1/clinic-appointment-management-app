// This file defines the structure for doctor schedules in the database.
// Schedules show when doctors are available for appointments.

const mongoose = require("mongoose");

// Define the schema for doctor schedules
const scheduleSchema = new mongoose.Schema(
  {
    // Unique code for the schedule
    scheduleCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    // Doctor this schedule belongs to
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
      index: true
    },
    // Doctor's name
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    // List of days the doctor is available (e.g., ["Monday", "Wednesday"])
    availableDays: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one available day is required"
      }
    },
    // Start time of availability (e.g., "09:00")
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    // End time of availability (e.g., "17:00")
    endTime: {
      type: String,
      required: true,
      trim: true
    },
    // Current status of the schedule
    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available"
    },
    // Whether this schedule is currently active
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

// Create index for faster searches by doctor name and time
scheduleSchema.index({ doctorName: 1, startTime: 1 });

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("Schedule", scheduleSchema);
