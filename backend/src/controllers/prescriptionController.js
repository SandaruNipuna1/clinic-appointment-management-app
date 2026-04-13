const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");
const asyncHandler = require("../utils/asyncHandler");

const createPrescription = asyncHandler(async (req, res) => {
  const medicalRecord = await MedicalRecord.findById(req.body.medicalRecordId);

  if (!medicalRecord) {
    res.status(404);
    throw new Error("Linked medical record not found");
  }

  const existingPrescription = await Prescription.findOne({
    medicalRecordId: req.body.medicalRecordId
  });

  if (existingPrescription) {
    res.status(400);
    throw new Error("A prescription already exists for this medical record");
  }

  if (medicalRecord.patientId.toString() !== req.body.patientId) {
    res.status(400);
    throw new Error("patientId does not match the linked medical record");
  }

  const prescription = await Prescription.create(req.body);

  res.status(201).json(prescription);
});

const getPrescriptionsByPatient = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    patientId: req.params.patientId
  }).sort({ prescribedDate: -1 });

  res.status(200).json(prescriptions);
});

const getMyPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    patientId: req.user.id
  }).sort({ prescribedDate: -1 });

  res.status(200).json(prescriptions);
});

const updatePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  if (req.body.medicalRecordId) {
    const medicalRecord = await MedicalRecord.findById(req.body.medicalRecordId);

    if (!medicalRecord) {
      res.status(404);
      throw new Error("Linked medical record not found");
    }
  }

  Object.assign(prescription, req.body);
  const updatedPrescription = await prescription.save();

  await Report.deleteOne({ prescriptionId: prescription._id });

  res.status(200).json(updatedPrescription);
});

const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  await Report.deleteOne({ prescriptionId: prescription._id });
  await prescription.deleteOne();

  res.status(200).json({ message: "Prescription deleted successfully" });
});

module.exports = {
  createPrescription,
  getPrescriptionsByPatient,
  getMyPrescriptions,
  updatePrescription,
  deletePrescription
};
