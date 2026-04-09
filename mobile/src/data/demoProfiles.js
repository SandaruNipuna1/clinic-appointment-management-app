export const SAMPLE_PATIENTS = [
  { id: "661111111111111111111111", name: "Nimal Perera" },
  { id: "661111111111111111111112", name: "Kavindi Silva" }
];

export const SAMPLE_DOCTORS = [
  { id: "662222222222222222222221", name: "Dr. Fernando", specialty: "General Medicine", badge: "GF" },
  { id: "662222222222222222222222", name: "Dr. Jayasinghe", specialty: "Cardiology", badge: "CJ" }
];

export const PATIENT_NAME_BY_ID = Object.fromEntries(SAMPLE_PATIENTS.map((patient) => [patient.id, patient.name]));
export const DOCTOR_NAME_BY_ID = Object.fromEntries(SAMPLE_DOCTORS.map((doctor) => [doctor.id, doctor.name]));
