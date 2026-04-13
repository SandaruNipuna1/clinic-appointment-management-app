const express = require("express");

const {
  createPrescription,
  getPrescriptionsByPatient,
  getMyPrescriptions,
  updatePrescription,
  deletePrescription
} = require("../controllers/prescriptionController");
const { protect, adminOnly, patientOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  prescriptionIdParamValidation,
  patientIdParamValidation,
  createPrescriptionValidation,
  updatePrescriptionValidation
} = require("../validators/prescriptionValidators");

const router = express.Router();

router.post("/", protect, adminOnly, createPrescriptionValidation, validateRequest, createPrescription);
router.get("/my", protect, patientOnly, getMyPrescriptions);
router.get(
  "/patient/:patientId",
  protect,
  adminOnly,
  patientIdParamValidation,
  validateRequest,
  getPrescriptionsByPatient
);
router.put("/:id", protect, adminOnly, updatePrescriptionValidation, validateRequest, updatePrescription);
router.delete("/:id", protect, adminOnly, prescriptionIdParamValidation, validateRequest, deletePrescription);

module.exports = router;
