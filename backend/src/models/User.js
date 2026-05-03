const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
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
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
<<<<<<< HEAD
      enum: ["admin", "receptionist", "patient"],
      default: "patient"
=======
      enum: ["admin", "receptionist"],
      default: "receptionist"
>>>>>>> 4a883649 (patient management module added)
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
