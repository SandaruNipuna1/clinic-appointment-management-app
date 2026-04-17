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

  getDoctors: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/doctors"
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
