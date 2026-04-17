const express = require("express");

const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  doctorIdParamValidation,
  createDoctorValidation,
  updateDoctorValidation
} = require("../validators/doctorValidators");

const router = express.Router();

router.get("/", protect, getAllDoctors);
router.get("/:id", protect, doctorIdParamValidation, validateRequest, getDoctorById);
router.post("/", protect, adminOnly, createDoctorValidation, validateRequest, createDoctor);
router.put("/:id", protect, adminOnly, updateDoctorValidation, validateRequest, updateDoctor);
router.delete("/:id", protect, adminOnly, doctorIdParamValidation, validateRequest, deleteDoctor);

module.exports = router;
