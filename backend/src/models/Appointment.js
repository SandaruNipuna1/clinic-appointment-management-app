const mongoose = require("mongoose");

// This defines the shape of an appointment record in MongoDB
const appointmentSchema = new mongoose.Schema(
  {
    // A short code used for the appointment, e.g. APT123
    appointmentCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    // Link to the patient record if one exists
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null
    },
    // Patient's name shown on the appointment
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    // Link to the doctor record
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    // Doctor's name shown on the appointment
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    // The date of the appointment
    date: {
      type: Date,
      required: true
    },
    // The time slot for the appointment, stored as text like "10:30"
    time: {
      type: String,
      required: true,
      trim: true
    },
    // Why the patient is coming in
    reason: {
      type: String,
      required: true,
      trim: true
    },
    // Current status of the appointment
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Make it faster to search for appointments by doctor, date, and time
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });
appointmentSchema.index(
  { doctorId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["Scheduled", "Completed"] } }
  }
);
// Make it faster to search by patient name and sort by date
appointmentSchema.index({ patientName: 1, date: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
