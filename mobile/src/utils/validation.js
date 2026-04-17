export function validateSession(values) {
  const errors = {};

  if (!values.apiBaseUrl.trim()) {
    errors.apiBaseUrl = "API base URL is required";
  }

  if (!values.token.trim()) {
    errors.token = "JWT token is required";
  }

  if (!values.userId.trim()) {
    errors.userId = "User id is required";
  }

  if (!["admin", "patient"].includes(values.role)) {
    errors.role = "Role must be admin or patient";
  }

  return errors;
}

export function validateMedicalRecord(values) {
  const errors = {};
  const requiredFields = [
    "patientId",
    "appointmentId",
    "doctorName",
    "symptoms",
    "diagnosis",
    "visitDate"
  ];

  requiredFields.forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
}

export function validatePrescription(values) {
  const errors = {};

  if (!values.medicalRecordId.trim()) {
    errors.medicalRecordId = "medicalRecordId is required";
  }

  if (!values.patientId.trim()) {
    errors.patientId = "patientId is required";
  }

  if (!values.prescribedDate.trim()) {
    errors.prescribedDate = "prescribedDate is required";
  }

  values.medicines.forEach((medicine, index) => {
    const prefix = `medicine_${index}`;
    if (!medicine.medicineName.trim()) {
      errors[`${prefix}_medicineName`] = "Medicine name is required";
    }
    if (!medicine.dosage.trim()) {
      errors[`${prefix}_dosage`] = "Dosage is required";
    }
    if (!medicine.frequency.trim()) {
      errors[`${prefix}_frequency`] = "Frequency is required";
    }
    if (!medicine.duration.trim()) {
      errors[`${prefix}_duration`] = "Duration is required";
    }
  });

  return errors;
}

export function validateReport(values) {
  const errors = {};
  const requiredFields = [
    "medicalRecordId",
    "patientName",
    "appointmentId"
  ];

  requiredFields.forEach((field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = `${field} is required`;
    }
  });

  return errors;
}

export function validateDoctor(values) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!values.name.trim()) {
    errors.name = "name is required";
  }

  if (!values.specialization.trim()) {
    errors.specialization = "specialization is required";
  }

  if (!values.email.trim()) {
    errors.email = "email is required";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "email must be valid";
  }

  if (!values.phone.trim()) {
    errors.phone = "phone is required";
  }

  if (values.experience.trim() && Number.isNaN(Number(values.experience))) {
    errors.experience = "experience must be a number";
  }

  values.availability.forEach((slot, index) => {
    const prefix = `availability_${index}`;

    if (!slot.day.trim()) {
      errors[`${prefix}_day`] = "day is required";
    }

    if (!timePattern.test(slot.startTime.trim())) {
      errors[`${prefix}_startTime`] = "start time must use HH:MM";
    }

    if (!timePattern.test(slot.endTime.trim())) {
      errors[`${prefix}_endTime`] = "end time must use HH:MM";
    }
  });

  return errors;
}
