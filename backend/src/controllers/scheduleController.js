const Schedule = require("../models/Schedule");
const asyncHandler = require("../utils/asyncHandler");
const generateEntityCode = require("../utils/generateEntityCode");

const getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({ isActive: true }).sort({
    doctorName: 1,
    availableDay: 1,
    startTime: 1
  });

  res.status(200).json(schedules);
});

const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findOne({ _id: req.params.id, isActive: true });

  if (!schedule) {
    res.status(404);
    throw new Error("Schedule not found");
  }

  res.status(200).json(schedule);
});

const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.create({
    ...req.body,
    doctorName: req.body.doctorName.trim(),
    availableDay: req.body.availableDay.trim(),
    startTime: req.body.startTime.trim(),
    endTime: req.body.endTime.trim(),
    scheduleCode: await generateEntityCode(Schedule, "scheduleCode", "SCH")
  });

  res.status(201).json(schedule);
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule || !schedule.isActive) {
    res.status(404);
    throw new Error("Schedule not found");
  }

  Object.assign(schedule, req.body);
  const updatedSchedule = await schedule.save();

  res.status(200).json(updatedSchedule);
});

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
