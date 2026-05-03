<<<<<<< HEAD
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
=======
const connectDB = async () => {
  console.log("Using local in-memory store");
>>>>>>> 4a883649 (patient management module added)
};

module.exports = connectDB;
