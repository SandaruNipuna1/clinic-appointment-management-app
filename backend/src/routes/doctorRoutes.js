const express = require("express");

const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController");
const { protect, adminOrReceptionist, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  doctorIdParamValidation,
  createDoctorValidation,
  updateDoctorValidation
} = require("../validators/doctorValidators");

const router = express.Router();

router.get("/", protect, getAllDoctors);
router.get("/:id", protect, doctorIdParamValidation, validateRequest, getDoctorById);
router.post("/", protect, adminOrReceptionist, createDoctorValidation, validateRequest, createDoctor);
router.put("/:id", protect, adminOrReceptionist, updateDoctorValidation, validateRequest, updateDoctor);
router.delete("/:id", protect, adminOnly, doctorIdParamValidation, validateRequest, deleteDoctor);

module.exports = router;
