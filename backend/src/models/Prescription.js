const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      default: "",
      trim: true
    }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: true,
      unique: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one medicine is required"
      }
    },
    prescribedDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

prescriptionSchema.index({ patientId: 1, prescribedDate: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
