const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    doctorCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    bio: {
      type: String,
      trim: true,
      default: ""
    },
    availability: {
      type: [availabilitySchema],
      default: []
    },
    availabilityLabel: {
      type: String,
      trim: true,
      default: ""
    },
    roomNumber: {
      type: String,
      trim: true,
      default: ""
    },
    department: {
      type: String,
      trim: true,
      default: ""
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

module.exports = mongoose.model("Doctor", doctorSchema);
