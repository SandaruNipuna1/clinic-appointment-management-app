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
