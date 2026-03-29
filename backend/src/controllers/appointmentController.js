import Appointment from "../models/Appointment.js";
import ApiError from "../utils/ApiError.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validateDateAndTime = (appointmentDate, appointmentTime) => {
  if (!DATE_PATTERN.test(appointmentDate)) {
    throw new ApiError(400, "appointmentDate must use YYYY-MM-DD format");
  }

  if (!TIME_PATTERN.test(appointmentTime)) {
    throw new ApiError(400, "appointmentTime must use HH:MM 24-hour format");
  }
};

const validateAppointmentPayload = ({ patientId, doctorId, appointmentDate, appointmentTime, reason }) => {
  if (!patientId || !doctorId || !appointmentDate || !appointmentTime || !reason?.trim()) {
    throw new ApiError(400, "patientId, doctorId, appointmentDate, appointmentTime, and reason are required");
  }

  validateDateAndTime(appointmentDate, appointmentTime);
};

const hasDoctorConflict = async ({ doctorId, appointmentDate, appointmentTime, excludeId }) => {
  const existing = await Appointment.findOne({
    doctorId,
    appointmentDate,
    appointmentTime,
    status: { $ne: "cancelled" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {})
  });

  return Boolean(existing);
};

export const createAppointment = async (req, res, next) => {
  try {
    validateAppointmentPayload(req.body);

    const conflict = await hasDoctorConflict(req.body);
    if (conflict) {
      throw new ApiError(409, "Doctor already has an appointment at this date and time");
    }

    const appointment = await Appointment.create(req.body);

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (_req, res, next) => {
  try {
    const appointments = await Appointment.find().sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPatient = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId
    }).sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    const nextDoctorId = req.body.doctorId || appointment.doctorId.toString();
    const nextDate = req.body.appointmentDate || appointment.appointmentDate;
    const nextTime = req.body.appointmentTime || appointment.appointmentTime;

    validateDateAndTime(nextDate, nextTime);

    if (req.body.status && !["booked", "completed", "cancelled"].includes(req.body.status)) {
      throw new ApiError(400, "status must be booked, completed, or cancelled");
    }

    const conflict = await hasDoctorConflict({
      doctorId: nextDoctorId,
      appointmentDate: nextDate,
      appointmentTime: nextTime,
      excludeId: appointment._id
    });

    if (conflict) {
      throw new ApiError(409, "Requested slot is already booked for this doctor");
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    if (appointment.status === "cancelled") {
      throw new ApiError(400, "Appointment is already cancelled");
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
