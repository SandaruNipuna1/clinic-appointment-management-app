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

router.get("/", protect, reportViewer, getMedicalReports);
router.get("/:id", protect, reportViewer, medicalReportIdParamValidation, validateRequest, getMedicalReportById);
router.post("/", protect, adminOrReceptionist, createMedicalReportValidation, validateRequest, createMedicalReport);
router.post(
  "/:id/attachment",
  protect,
  adminOnly,
  medicalReportIdParamValidation,
  validateRequest,
  upload.single("attachment"),
  uploadMedicalReportAttachment
);
router.put("/:id", protect, adminOnly, updateMedicalReportValidation, validateRequest, updateMedicalReport);
router.delete("/:id", protect, adminOnly, medicalReportIdParamValidation, validateRequest, deleteMedicalReport);

module.exports = router;
