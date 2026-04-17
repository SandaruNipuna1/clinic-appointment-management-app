import { apiRequest } from "./apiClient";

export const moduleApi = {
  getAppointments: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/appointments"
    }),

  getAppointmentById: ({ baseUrl, token, appointmentId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/appointments/${appointmentId}`
    }),

  createAppointment: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/appointments",
      method: "POST",
      body: payload
    }),

  updateAppointment: ({ baseUrl, token, appointmentId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/appointments/${appointmentId}`,
      method: "PUT",
      body: payload
    }),

  deleteAppointment: ({ baseUrl, token, appointmentId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/appointments/${appointmentId}`,
      method: "DELETE"
    }),

  getMedicalReports: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/medical-reports"
    }),

  getMedicalReportById: ({ baseUrl, token, reportId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/medical-reports/${reportId}`
    }),

  createMedicalReport: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/medical-reports",
      method: "POST",
      body: payload
    }),

  updateMedicalReport: ({ baseUrl, token, reportId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/medical-reports/${reportId}`,
      method: "PUT",
      body: payload
    }),

  deleteMedicalReport: ({ baseUrl, token, reportId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/medical-reports/${reportId}`,
      method: "DELETE"
    }),

  getMedicalRecordsByPatient: ({ baseUrl, token, patientId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/medical-records/patient/${patientId}`
    }),

  getMyMedicalRecords: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/medical-records/my"
    }),

  createMedicalRecord: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/medical-records",
      method: "POST",
      body: payload
    }),

  updateMedicalRecord: ({ baseUrl, token, recordId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/medical-records/${recordId}`,
      method: "PUT",
      body: payload
    }),

  deleteMedicalRecord: ({ baseUrl, token, recordId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/medical-records/${recordId}`,
      method: "DELETE"
    }),

  getPrescriptionsByPatient: ({ baseUrl, token, patientId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/prescriptions/patient/${patientId}`
    }),

  getMyPrescriptions: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/prescriptions/my"
    }),

  createPrescription: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/prescriptions",
      method: "POST",
      body: payload
    }),

  updatePrescription: ({ baseUrl, token, prescriptionId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/prescriptions/${prescriptionId}`,
      method: "PUT",
      body: payload
    }),

  deletePrescription: ({ baseUrl, token, prescriptionId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/prescriptions/${prescriptionId}`,
      method: "DELETE"
    }),

  generateReport: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/reports/generate",
      method: "POST",
      body: payload
    }),

  getReportsByPatient: ({ baseUrl, token, patientId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/reports/patient/${patientId}`
    }),

  getMyReports: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/reports/my"
    }),

  getReportById: ({ baseUrl, token, reportId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/reports/${reportId}`
    }),

  getDoctors: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/doctors"
    }),

  getDoctorById: ({ baseUrl, token, doctorId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/doctors/${doctorId}`
    }),

  createDoctor: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/doctors",
      method: "POST",
      body: payload
    }),

  updateDoctor: ({ baseUrl, token, doctorId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/doctors/${doctorId}`,
      method: "PUT",
      body: payload
    }),

  deleteDoctor: ({ baseUrl, token, doctorId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/doctors/${doctorId}`,
      method: "DELETE"
    })
};
