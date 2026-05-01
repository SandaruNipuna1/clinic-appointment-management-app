import { apiRequest, normalizeApiBaseUrl } from "./apiClient";

const uploadRequest = async ({ baseUrl, token, endpoint, file }) => {
  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl);
  const formData = new FormData();
  formData.append("attachment", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/octet-stream"
  });

  const response = await fetch(`${normalizedBaseUrl}${endpoint}`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined,
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = data?.errors?.map((item) => item.msg).join(", ");
    throw new Error(validationErrors || data?.message || "Upload failed");
  }

  return data;
};

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

  uploadMedicalReportAttachment: ({ baseUrl, token, reportId, file }) =>
    uploadRequest({
      baseUrl,
      token,
      endpoint: `/medical-reports/${reportId}/attachment`,
      file
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
    }),

  getPatients: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/patients"
    }),

  createPatient: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/patients",
      method: "POST",
      body: payload
    }),

  updatePatient: ({ baseUrl, token, patientId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/patients/${patientId}`,
      method: "PUT",
      body: payload
    }),

  deletePatient: ({ baseUrl, token, patientId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/patients/${patientId}`,
      method: "DELETE"
    }),

  getSchedules: ({ baseUrl, token }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/schedules"
    }),

  createSchedule: ({ baseUrl, token, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: "/schedules",
      method: "POST",
      body: payload
    }),

  updateSchedule: ({ baseUrl, token, scheduleId, payload }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/schedules/${scheduleId}`,
      method: "PUT",
      body: payload
    }),

  deleteSchedule: ({ baseUrl, token, scheduleId }) =>
    apiRequest({
      baseUrl,
      token,
      endpoint: `/schedules/${scheduleId}`,
      method: "DELETE"
    })
};
