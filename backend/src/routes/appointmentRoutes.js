const express = require("express");

const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require("../controllers/appointmentController");
const { protect, adminOrReceptionist } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  appointmentIdParamValidation,
  createAppointmentValidation,
  updateAppointmentValidation
} = require("../validators/appointmentValidators");

const router = express.Router();

router.get("/", protect, getAppointments);
router.get("/:id", protect, appointmentIdParamValidation, validateRequest, getAppointmentById);
router.post("/", protect, adminOrReceptionist, createAppointmentValidation, validateRequest, createAppointment);
router.put("/:id", protect, adminOrReceptionist, updateAppointmentValidation, validateRequest, updateAppointment);
router.delete("/:id", protect, adminOrReceptionist, appointmentIdParamValidation, validateRequest, deleteAppointment);

module.exports = router;
