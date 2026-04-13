import { apiRequest } from "./apiClient";

export const moduleApi = {
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
    })
};
