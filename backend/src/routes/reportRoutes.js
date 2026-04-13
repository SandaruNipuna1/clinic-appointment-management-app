const express = require("express");

const {
  generateReport,
  getReportById,
  getReportsByPatient,
  getMyReports
} = require("../controllers/reportController");
const { protect, adminOnly, patientOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  reportIdParamValidation,
  patientIdParamValidation,
  createReportValidation
} = require("../validators/reportValidators");

const router = express.Router();

router.post("/generate", protect, adminOnly, createReportValidation, validateRequest, generateReport);
router.get("/my", protect, patientOnly, getMyReports);
router.get(
  "/patient/:patientId",
  protect,
  adminOnly,
  patientIdParamValidation,
  validateRequest,
  getReportsByPatient
);
router.get("/:id", protect, reportIdParamValidation, validateRequest, getReportById);

module.exports = router;
