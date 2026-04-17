const express = require("express");

const {
  getMedicalReports,
  getMedicalReportById,
  createMedicalReport,
  updateMedicalReport,
  deleteMedicalReport
} = require("../controllers/medicalReportCrudController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  medicalReportIdParamValidation,
  createMedicalReportValidation,
  updateMedicalReportValidation
} = require("../validators/medicalReportValidators");

const router = express.Router();

router.get("/", protect, getMedicalReports);
router.get("/:id", protect, medicalReportIdParamValidation, validateRequest, getMedicalReportById);
router.post("/", protect, adminOnly, createMedicalReportValidation, validateRequest, createMedicalReport);
router.put("/:id", protect, adminOnly, updateMedicalReportValidation, validateRequest, updateMedicalReport);
router.delete("/:id", protect, adminOnly, medicalReportIdParamValidation, validateRequest, deleteMedicalReport);

module.exports = router;
