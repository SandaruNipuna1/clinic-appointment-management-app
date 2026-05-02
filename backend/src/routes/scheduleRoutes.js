const express = require("express");

const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require("../controllers/scheduleController");
const { protect, adminOrReceptionist } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  scheduleIdParamValidation,
  createScheduleValidation,
  updateScheduleValidation
} = require("../validators/scheduleValidators");

const router = express.Router();

router.get("/", protect, getAllSchedules);
router.get("/:id", protect, scheduleIdParamValidation, validateRequest, getScheduleById);
router.post("/", protect, adminOrReceptionist, createScheduleValidation, validateRequest, createSchedule);
router.put("/:id", protect, adminOrReceptionist, updateScheduleValidation, validateRequest, updateSchedule);
router.delete("/:id", protect, adminOrReceptionist, scheduleIdParamValidation, validateRequest, deleteSchedule);

module.exports = router;
