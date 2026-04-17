const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });
appointmentSchema.index({ patientName: 1, date: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
