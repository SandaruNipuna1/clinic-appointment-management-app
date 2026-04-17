const express = require("express");
const cors = require("cors");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Clinic backend is running" });
});

app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/doctors", doctorRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
