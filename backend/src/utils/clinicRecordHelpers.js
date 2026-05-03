const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Schedule = require("../models/Schedule");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const parseDateOnly = (value, fieldName = "date") => {
  if (!DATE_PATTERN.test(value || "")) {
    const error = new Error(`${fieldName} must use YYYY-MM-DD format`);
    error.statusCode = 400;
    throw error;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    const error = new Error(`${fieldName} must be a real calendar date`);
    error.statusCode = 400;
    throw error;
  }

  return date;
};

const assertDateIsNotPast = (date, fieldName = "date") => {
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  if (date < todayUtc) {
    const error = new Error(`${fieldName} cannot be in the past`);
    error.statusCode = 400;
    throw error;
  }
};

const minutesFromTime = (value) => {
  if (!TIME_PATTERN.test(value || "")) {
    const error = new Error("time must use HH:MM 24-hour format");
    error.statusCode = 400;
    throw error;
  }

  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};

const assertStartBeforeEnd = (startTime, endTime) => {
  if (minutesFromTime(startTime) >= minutesFromTime(endTime)) {
    const error = new Error("startTime must be before endTime");
    error.statusCode = 400;
    throw error;
  }
};

const getUtcDayName = (date) =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()];

const getPatientLookupForUser = (user) => ({
  isActive: true,
  $or: [
    { userId: user.id },
    ...(user.email ? [{ email: normalizeText(user.email) }] : [])
  ]
});

const findLinkedPatientForUser = async (user) => Patient.findOne(getPatientLookupForUser(user));

const getPatientIdsForUser = async (user) => {
  const patients = await Patient.find(getPatientLookupForUser(user)).select("_id").lean();
  return patients.map((patient) => patient._id);
};

const requireActivePatient = async (patientId) => {
  const patient = await Patient.findOne({ _id: patientId, isActive: true });

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

const requireActiveDoctor = async (doctorId) => {
  const doctor = await Doctor.findOne({ _id: doctorId, isActive: true });

  if (!doctor) {
    const error = new Error("Doctor not found");
    error.statusCode = 404;
    throw error;
  }

  return doctor;
};

const timeWithinRange = (time, startTime, endTime) => {
  const minutes = minutesFromTime(time);
  return minutes >= minutesFromTime(startTime) && minutes < minutesFromTime(endTime);
};

const assertDoctorAvailableForSlot = async ({ doctor, date, time }) => {
  const dayName = getUtcDayName(date);
  const matchingSchedules = await Schedule.find({
    $or: [{ doctorId: doctor._id }, { doctorName: doctor.name }],
    availableDays: dayName,
    status: "Available",
    isActive: true
  }).lean();
  const matchingSchedule = matchingSchedules.some((schedule) => timeWithinRange(time, schedule.startTime, schedule.endTime));

  if (!matchingSchedule) {
    const error = new Error("Doctor is not available for the selected day and time");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  assertDoctorAvailableForSlot,
  assertDateIsNotPast,
  assertStartBeforeEnd,
  findLinkedPatientForUser,
  getPatientIdsForUser,
  minutesFromTime,
  normalizeText,
  parseDateOnly,
  requireActiveDoctor,
  requireActivePatient
};
