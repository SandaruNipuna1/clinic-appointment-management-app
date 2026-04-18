const MedicalReport = require("../models/MedicalReport");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");

const serializeMedicalReport = (report) => ({
  ...(typeof report.toObject === "function" ? report.toObject() : report),
  reportDate: report.reportDate
});

const getMedicalReports = asyncHandler(async (req, res) => {
  const query = req.user.role === "patient" ? { patientId: req.user.id } : {};
  const reports = await MedicalReport.find(query)
    .sort({ reportDate: -1, createdAt: -1 })
    .lean();

  res.status(200).json(reports);
});

const getMedicalReportById = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  if (req.user.role === "patient" && String(report.patientId || "") !== String(req.user.id)) {
    res.status(403);
    throw new Error("Access denied");
  }

  res.status(200).json(report);
});

const createMedicalReport = asyncHandler(async (req, res) => {
  const report = await MedicalReport.create({
    reportCode: await generateEntityCode(MedicalReport, "reportCode", "REP"),
    patientId: req.body.patientId || null,
    patientName: req.body.patientName.trim(),
    doctorName: req.body.doctorName.trim(),
    diagnosis: req.body.diagnosis.trim(),
    symptoms: req.body.symptoms.trim(),
    treatment: req.body.treatment.trim(),
    prescriptionNote: req.body.prescriptionNote.trim(),
    reportDate: new Date(`${req.body.reportDate}T00:00:00.000Z`),
    additionalNotes: req.body.additionalNotes?.trim() || ""
  });

  res.status(201).json(serializeMedicalReport(report));
});

const updateMedicalReport = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  if (req.body.patientId !== undefined) {
    report.patientId = req.body.patientId || null;
  }

  if (req.body.patientName) {
    report.patientName = req.body.patientName.trim();
  }

  if (req.body.doctorName) {
    report.doctorName = req.body.doctorName.trim();
  }

  if (req.body.diagnosis) {
    report.diagnosis = req.body.diagnosis.trim();
  }

  if (req.body.symptoms) {
    report.symptoms = req.body.symptoms.trim();
  }

  if (req.body.treatment) {
    report.treatment = req.body.treatment.trim();
  }

  if (req.body.prescriptionNote) {
    report.prescriptionNote = req.body.prescriptionNote.trim();
  }

  if (req.body.reportDate) {
    report.reportDate = new Date(`${req.body.reportDate}T00:00:00.000Z`);
  }

  if (req.body.additionalNotes !== undefined) {
    report.additionalNotes = req.body.additionalNotes.trim();
  }

  const updatedReport = await report.save();

  res.status(200).json(serializeMedicalReport(updatedReport));
});

const deleteMedicalReport = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  await report.deleteOne();

  res.status(200).json({ message: "Medical report deleted successfully" });
});

module.exports = {
  getMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport
};
