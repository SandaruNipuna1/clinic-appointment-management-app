// This file defines the structure for medical reports in the database.
// Medical reports contain patient diagnosis, symptoms, treatment, and other health information.

const mongoose = require("mongoose");

// Define the schema (structure) for medical reports
const medicalReportSchema = new mongoose.Schema(
  {
    // Unique code for the report
    reportCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    // Reference to the patient profile
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null
    },
    // Patient's full name
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    // Doctor's name who created the report
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    // Doctor this report is associated with
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null
    },
    // Medical diagnosis
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    // Patient's symptoms
    symptoms: {
      type: String,
      required: true,
      trim: true
    },
    // Recommended treatment
    treatment: {
      type: String,
      required: true,
      trim: true
    },
    // Notes about prescription
    prescriptionNote: {
      type: String,
      required: true,
      trim: true
    },
    // Date when the report was created
    reportDate: {
      type: Date,
      required: true
    },
    // Any additional notes
    additionalNotes: {
      type: String,
      trim: true,
      default: ""
    },
    // Name of attached file (if any)
    attachmentName: {
      type: String,
      trim: true,
      default: ""
    },
    // URL where the attachment is stored
    attachmentUrl: {
      type: String,
      trim: true,
      default: ""
    },
    // Type of the attachment file
    attachmentMimeType: {
      type: String,
      trim: true,
      default: ""
    },
    // Size of the attachment file in bytes
    attachmentSize: {
      type: Number,
      default: 0
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Create indexes for faster searches by patient name and date
medicalReportSchema.index({ patientName: 1, reportDate: -1 });
// Create indexes for faster searches by doctor name and date
medicalReportSchema.index({ doctorName: 1, reportDate: -1 });

// Export the model so it can be used in other parts of the app
module.exports = mongoose.model("MedicalReport", medicalReportSchema);
