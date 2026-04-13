const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true
    },
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    symptoms: {
      type: String,
      required: true,
      trim: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    treatmentNotes: {
      type: String,
      default: "",
      trim: true
    },
    visitDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "follow-up", "closed"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
