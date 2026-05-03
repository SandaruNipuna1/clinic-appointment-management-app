// This file handles all the operations for medical reports.
// It includes functions to create, read, update, delete reports, and manage attachments.
// Patients can only see their own reports, while staff can see all reports.

const MedicalReport = require("../models/MedicalReport");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");
const {
  getPatientIdsForUser,
  parseDateOnly,
  requireActiveDoctor,
  requireActivePatient
} = require("../utils/clinicRecordHelpers");

// Helper function to format report data for responses
const serializeMedicalReport = (report) => ({
  ...(typeof report.toObject === "function" ? report.toObject() : report),
  reportDate: report.reportDate
});

// Helper function to get query for patient reports (patients can only see their own)
const getPatientReportQuery = async (user) => {
  const linkedPatientIds = await getPatientIdsForUser(user);

  return {
    // user.id remains here for legacy reports created before patientId was normalized to Patient._id.
    $or: [{ patientId: user.id }, ...(linkedPatientIds.length > 0 ? [{ patientId: { $in: linkedPatientIds } }] : [])]
  };
};

// Get all medical reports (filtered by user role)
const getMedicalReports = asyncHandler(async (req, res) => {
  const query = req.user.role === "patient" ? await getPatientReportQuery(req.user) : {};
  const reports = await MedicalReport.find(query)
    .sort({ reportDate: -1, createdAt: -1 })
    .lean();

  res.status(200).json(reports);
});

// Get a specific medical report by ID
const getMedicalReportById = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  if (req.user.role === "patient") {
    const query = await getPatientReportQuery(req.user);
    const canAccessReport = await MedicalReport.exists({
      _id: report._id,
      ...query
    });

    if (!canAccessReport) {
      res.status(403);
      throw new Error("Access denied");
    }
  }

  res.status(200).json(report);
});

// Create a new medical report
const createMedicalReport = asyncHandler(async (req, res) => {
  const patient = await requireActivePatient(req.body.patientId);
  const doctor = await requireActiveDoctor(req.body.doctorId);

  const report = await MedicalReport.create({
    reportCode: await generateEntityCode(MedicalReport, "reportCode", "REP"),
    patientId: patient._id,
    patientName: patient.name,
    doctorId: doctor._id,
    doctorName: doctor.name,
    diagnosis: req.body.diagnosis.trim(),
    symptoms: req.body.symptoms.trim(),
    treatment: req.body.treatment.trim(),
    prescriptionNote: req.body.prescriptionNote.trim(),
    reportDate: parseDateOnly(req.body.reportDate, "reportDate"),
    additionalNotes: req.body.additionalNotes?.trim() || ""
  });

  res.status(201).json(serializeMedicalReport(report));
});

// Update an existing medical report
const updateMedicalReport = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  if (req.body.patientId !== undefined) {
    const patient = await requireActivePatient(req.body.patientId);
    report.patientId = patient._id;
    report.patientName = patient.name;
  }

  if (req.body.doctorId !== undefined) {
    const doctor = await requireActiveDoctor(req.body.doctorId);
    report.doctorId = doctor._id;
    report.doctorName = doctor.name;
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
    report.reportDate = parseDateOnly(req.body.reportDate, "reportDate");
  }

  if (req.body.additionalNotes !== undefined) {
    report.additionalNotes = req.body.additionalNotes.trim();
  }

  const updatedReport = await report.save();

  res.status(200).json(serializeMedicalReport(updatedReport));
});

// Delete a medical report
const deleteMedicalReport = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  await report.deleteOne();

  res.status(200).json({ message: "Medical report deleted successfully" });
});

// Upload an attachment to a medical report
const uploadMedicalReportAttachment = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Medical report not found");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Attachment file is required");
  }

  report.attachmentName = req.file.originalname;
  report.attachmentUrl = `/uploads/medical-reports/${req.file.filename}`;
  report.attachmentMimeType = req.file.mimetype || "";
  report.attachmentSize = req.file.size || 0;

  const updatedReport = await report.save();

  res.status(200).json(serializeMedicalReport(updatedReport));
});

module.exports = {
  getMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
  uploadMedicalReportAttachment
};
