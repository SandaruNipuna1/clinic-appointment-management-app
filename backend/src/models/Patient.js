const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

patientSchema.index({ name: 1 });

module.exports = mongoose.model("Patient", patientSchema);
