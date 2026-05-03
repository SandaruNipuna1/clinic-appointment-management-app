// This file defines the API routes for medical report CRUD operations.
// It sets up endpoints for managing medical reports with role-based access control and file uploads.

const express = require("express");

const {
  getMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
  uploadMedicalReportAttachment
} = require("../controllers/medicalReportCrudController");
const { protect, adminOnly, adminOrReceptionist, reportViewer } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  medicalReportIdParamValidation,
  createMedicalReportValidation,
  updateMedicalReportValidation
} = require("../validators/medicalReportValidators");

const router = express.Router();

// Get all medical reports (requires report viewer role)
router.get("/", protect, reportViewer, getMedicalReports);

// Get a specific medical report by ID (requires report viewer role)
router.get("/:id", protect, reportViewer, medicalReportIdParamValidation, validateRequest, getMedicalReportById);

// Create a new medical report (requires admin or receptionist role)
router.post("/", protect, adminOrReceptionist, createMedicalReportValidation, validateRequest, createMedicalReport);

// Upload attachment to a medical report (requires admin role)
router.post(
  "/:id/attachment",
  protect,
  adminOnly,
  medicalReportIdParamValidation,
  validateRequest,
  upload.single("attachment"),
  uploadMedicalReportAttachment
);

// Update a medical report (requires admin role)
router.put("/:id", protect, adminOnly, updateMedicalReportValidation, validateRequest, updateMedicalReport);

// Delete a medical report (requires admin role)
router.delete("/:id", protect, adminOnly, medicalReportIdParamValidation, validateRequest, deleteMedicalReport);

module.exports = router;
