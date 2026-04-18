const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    scheduleCode: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    availableDay: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    endTime: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available"
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

scheduleSchema.index({ doctorName: 1, availableDay: 1, startTime: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
