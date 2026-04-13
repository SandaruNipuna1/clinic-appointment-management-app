const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");
const asyncHandler = require("../utils/asyncHandler");
const { buildPrescriptionSummary } = require("../services/reportService");

const generateReport = asyncHandler(async (req, res) => {
  const { medicalRecordId, patientDetails, appointmentDetails } = req.body;

  const medicalRecord = await MedicalRecord.findById(medicalRecordId);

  if (!medicalRecord) {
    res.status(404);
    throw new Error("Medical record not found");
  }

  const prescription = await Prescription.findOne({ medicalRecordId });

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found for this medical record");
  }

  let report = await Report.findOne({ medicalRecordId });

  const reportPayload = {
    medicalRecordId: medicalRecord._id,
    prescriptionId: prescription._id,
    patientId: medicalRecord.patientId,
    patientDetails,
    appointmentDetails,
    diagnosis: medicalRecord.diagnosis,
    treatmentNotes: medicalRecord.treatmentNotes,
    prescriptionSummary: buildPrescriptionSummary(prescription.medicines),
    generatedDate: new Date()
  };

  if (report) {
    Object.assign(report, reportPayload);
    report = await report.save();
    return res.status(200).json(report);
  }

  report = await Report.create(reportPayload);

  res.status(201).json(report);
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }

  if (req.user.role === "patient" && report.patientId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Access denied to this report");
  }

  res.status(200).json(report);
});

const getReportsByPatient = asyncHandler(async (req, res) => {
  const reports = await Report.find({ patientId: req.params.patientId }).sort({
    generatedDate: -1
  });

  res.status(200).json(reports);
});

const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ patientId: req.user.id }).sort({
    generatedDate: -1
  });

  res.status(200).json(reports);
});

module.exports = {
  generateReport,
  getReportById,
  getReportsByPatient,
  getMyReports
};
