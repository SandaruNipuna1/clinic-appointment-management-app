const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.post('/', upload.single('image'), createDoctor);
router.put('/:id', upload.single('image'), updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;
