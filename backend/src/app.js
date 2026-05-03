// This file sets up the main Express application.
// It configures middleware, routes, and error handling for the backend API.

const express = require("express");
const cors = require("cors");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicalReportCrudRoutes = require("./routes/medicalReportCrudRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

// Create the Express application
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint to verify the server is running
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Clinic backend is running" });
});

// Set up API routes for different modules
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-reports", medicalReportCrudRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
