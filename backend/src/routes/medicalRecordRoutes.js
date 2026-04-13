const express = require("express");

const {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMyMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
} = require("../controllers/medicalRecordController");
const { protect, adminOnly, patientOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  medicalRecordIdParamValidation,
  patientIdParamValidation,
  createMedicalRecordValidation,
  updateMedicalRecordValidation
} = require("../validators/medicalRecordValidators");

const router = express.Router();

router.post("/", protect, adminOnly, createMedicalRecordValidation, validateRequest, createMedicalRecord);
router.get("/my", protect, patientOnly, getMyMedicalRecords);
router.get(
  "/patient/:patientId",
  protect,
  adminOnly,
  patientIdParamValidation,
  validateRequest,
  getMedicalRecordsByPatient
);
router.get("/:id", protect, medicalRecordIdParamValidation, validateRequest, getMedicalRecordById);
router.put("/:id", protect, adminOnly, updateMedicalRecordValidation, validateRequest, updateMedicalRecord);
router.delete("/:id", protect, adminOnly, medicalRecordIdParamValidation, validateRequest, deleteMedicalRecord);

module.exports = router;
