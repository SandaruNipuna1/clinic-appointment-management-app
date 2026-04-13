const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: true,
      unique: true
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    patientDetails: {
      name: { type: String, required: true, trim: true },
      age: { type: Number },
      gender: { type: String, trim: true },
      contactNumber: { type: String, trim: true }
    },
    appointmentDetails: {
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
      },
      appointmentDate: { type: Date },
      doctorName: { type: String, trim: true },
      appointmentStatus: { type: String, trim: true }
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
    prescriptionSummary: {
      type: String,
      required: true,
      trim: true
    },
    generatedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ patientId: 1, generatedDate: -1 });

module.exports = mongoose.model("Report", reportSchema);
