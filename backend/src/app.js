const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const path = require("path");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicalReportCrudRoutes = require("./routes/medicalReportCrudRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
=======

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
>>>>>>> 4a883649 (patient management module added)

const app = express();

app.use(cors());
app.use(express.json());
<<<<<<< HEAD
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Clinic backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-reports", medicalReportCrudRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/schedules", scheduleRoutes);
=======

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Patient management backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
>>>>>>> 4a883649 (patient management module added)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
