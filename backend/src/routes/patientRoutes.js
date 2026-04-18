const express = require("express");

const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require("../controllers/patientController");
const { protect, adminOrReceptionist } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  patientIdParamValidation,
  createPatientValidation,
  updatePatientValidation
} = require("../validators/patientValidators");

const router = express.Router();

router.get("/", protect, adminOrReceptionist, getAllPatients);
router.get("/:id", protect, adminOrReceptionist, patientIdParamValidation, validateRequest, getPatientById);
router.post("/", protect, adminOrReceptionist, createPatientValidation, validateRequest, createPatient);
router.put("/:id", protect, adminOrReceptionist, updatePatientValidation, validateRequest, updatePatient);
router.delete("/:id", protect, adminOrReceptionist, patientIdParamValidation, validateRequest, deletePatient);

module.exports = router;
