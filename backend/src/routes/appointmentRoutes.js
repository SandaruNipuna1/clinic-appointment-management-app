import express from "express";
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  getAppointmentsByPatient,
  updateAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

router.route("/").post(createAppointment).get(getAppointments);
router.get("/patient/:patientId", getAppointmentsByPatient);
router.get("/:id", getAppointmentById);
router.patch("/:id", updateAppointment);
router.patch("/:id/cancel", cancelAppointment);
router.delete("/:id", deleteAppointment);

export default router;
