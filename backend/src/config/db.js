// This file handles connecting the app to the database.
// It uses MongoDB (a type of database) to store all the clinic information.

const mongoose = require("mongoose");

// This function connects to the MongoDB database using a connection string from environment variables.
const connectDB = async () => {
  try {
    // Try to connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    // If connection fails, show error and stop the app
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
