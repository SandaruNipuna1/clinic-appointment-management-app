const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    reportCode: {
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
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    symptoms: {
      type: String,
      required: true,
      trim: true
    },
    treatment: {
      type: String,
      required: true,
      trim: true
    },
    prescriptionNote: {
      type: String,
      required: true,
      trim: true
    },
    reportDate: {
      type: Date,
      required: true
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: ""
    },
    attachmentName: {
      type: String,
      trim: true,
      default: ""
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: ""
    },
    attachmentMimeType: {
      type: String,
      trim: true,
      default: ""
    },
    attachmentSize: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

medicalReportSchema.index({ patientName: 1, reportDate: -1 });
medicalReportSchema.index({ doctorName: 1, reportDate: -1 });

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
