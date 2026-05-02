const express = require("express");

const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  appointmentIdParamValidation,
  createAppointmentValidation,
  updateAppointmentValidation
} = require("../validators/appointmentValidators");

const router = express.Router();

router.get("/", protect, getAppointments);
router.get("/:id", protect, appointmentIdParamValidation, validateRequest, getAppointmentById);
router.post("/", protect, createAppointmentValidation, validateRequest, createAppointment);
router.put("/:id", protect, updateAppointmentValidation, validateRequest, updateAppointment);
router.delete("/:id", protect, appointmentIdParamValidation, validateRequest, deleteAppointment);

module.exports = router;
