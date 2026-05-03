// This controller manages doctor availability schedules.
// It handles creating, reading, updating, and deleting schedule entries.
// Schedules define when doctors are available for appointments.

const Schedule = require("../models/Schedule");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");
const { assertStartBeforeEnd, requireActiveDoctor } = require("../utils/clinicRecordHelpers");

// Helper function to normalize available days into an array format
const normalizeAvailableDays = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (value) {
    return [String(value).trim()].filter(Boolean);
  }

  return [];
};

const minutesFromTime = (value) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

const assertScheduleDoesNotOverlap = async ({ scheduleId, doctorId, availableDays, startTime, endTime }) => {
  const schedules = await Schedule.find({
    ...(scheduleId ? { _id: { $ne: scheduleId } } : {}),
    doctorId,
    availableDays: { $in: availableDays },
    status: "Available",
    isActive: true
  }).lean();
  const start = minutesFromTime(startTime);
  const end = minutesFromTime(endTime);
  const overlappingSchedule = schedules.find((schedule) => {
    const existingStart = minutesFromTime(schedule.startTime);
    const existingEnd = minutesFromTime(schedule.endTime);
    return start < existingEnd && end > existingStart;
  });

  if (overlappingSchedule) {
    const error = new Error("Schedule overlaps an existing availability slot for this doctor");
    error.statusCode = 409;
    throw error;
  }
};

// Get all active schedules, sorted by doctor name and start time
const getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({ isActive: true }).sort({
    doctorName: 1,
    startTime: 1
  });

  res.status(200).json(schedules);
});

// Get a specific schedule by its ID (only if active)
const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, isActive: true });

  if (!schedule) {
    res.status(404);
    throw new Error("Schedule not found");
  }

  res.status(200).json(schedule);
});

// Create a new schedule entry for a doctor
const createSchedule = asyncHandler(async (req, res) => {
  const doctor = req.body.doctorId
    ? await requireActiveDoctor(req.body.doctorId)
    : await Doctor.findOne({ name: req.body.doctorName.trim(), isActive: true });

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  assertStartBeforeEnd(req.body.startTime, req.body.endTime);
  const availableDays = normalizeAvailableDays(req.body.availableDays || req.body.availableDay);
  if ((req.body.status || "Available") === "Available") {
    await assertScheduleDoesNotOverlap({
      doctorId: doctor._id,
      availableDays,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
  }

  const schedule = await Schedule.create({
    ...req.body,
    doctorId: doctor._id,
    doctorName: doctor.name,
    availableDays,
    startTime: req.body.startTime.trim(),
    endTime: req.body.endTime.trim(),
    scheduleCode: await generateEntityCode(Schedule, "scheduleCode", "SCH")
  });

  res.status(201).json(schedule);
});

// Update an existing schedule entry
const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || !schedule.isActive) {
    res.status(404);
    throw new Error("Schedule not found");
  }

  // Update fields only if they are provided
  if (req.body.doctorName !== undefined) {
    const doctor = await Doctor.findOne({ name: req.body.doctorName.trim(), isActive: true });

    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }

    schedule.doctorId = doctor._id;
    schedule.doctorName = doctor.name;
  }

  if (req.body.doctorId !== undefined) {
    const doctor = await requireActiveDoctor(req.body.doctorId);
    schedule.doctorId = doctor._id;
    schedule.doctorName = doctor.name;
  }

  if (req.body.availableDays !== undefined || req.body.availableDay !== undefined) {
    schedule.availableDays = normalizeAvailableDays(req.body.availableDays || req.body.availableDay);
  }

  if (req.body.startTime !== undefined) {
    schedule.startTime = req.body.startTime.trim();
  }

  if (req.body.endTime !== undefined) {
    schedule.endTime = req.body.endTime.trim();
  }

  if (req.body.status !== undefined) {
    schedule.status = req.body.status;
  }

  assertStartBeforeEnd(schedule.startTime, schedule.endTime);
  if (schedule.status === "Available") {
    await assertScheduleDoesNotOverlap({
      scheduleId: schedule._id,
      doctorId: schedule.doctorId,
      availableDays: schedule.availableDays,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
  }

  const updatedSchedule = await schedule.save();

  res.status(200).json(updatedSchedule);
});

// Soft delete a schedule (mark as inactive)
const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || !schedule.isActive) {
    res.status(404);
    throw new Error("Schedule not found");
  }

  schedule.isActive = false;
  await schedule.save();

  res.status(200).json({ message: "Schedule removed successfully" });
});

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
