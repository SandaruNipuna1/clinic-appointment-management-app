const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");
const asyncHandler = require("../utils/asyncHandler");

const createMedicalRecord = asyncHandler(async (req, res) => {
  const existingRecord = await MedicalRecord.findOne({
    appointmentId: req.body.appointmentId
  });

  if (existingRecord) {
    res.status(400);
    throw new Error("A medical record already exists for this appointment");
  }

  const record = await MedicalRecord.create(req.body);

  res.status(201).json(record);
});

const getMedicalRecordsByPatient = asyncHandler(async (req, res) => {
  const patientId = req.params.patientId;

  const records = await MedicalRecord.find({ patientId }).sort({ visitDate: -1 });

  res.status(200).json(records);
});

const getMyMedicalRecords = asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ patientId: req.user.id }).sort({
    visitDate: -1
  });

  res.status(200).json(records);
});

const getMedicalRecordById = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }

  if (req.user.role === "patient" && record.patientId.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Access denied to this medical record");
  }

  res.status(200).json(record);
});

const updateMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }

  Object.assign(record, req.body);
  const updatedRecord = await record.save();

  res.status(200).json(updatedRecord);
});

const deleteMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }

  await Prescription.deleteOne({ medicalRecordId: record._id });
  await Report.deleteOne({ medicalRecordId: record._id });
  await record.deleteOne();

  res.status(200).json({ message: "Medical record deleted successfully" });
});

module.exports = {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMyMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
};
