import { apiRequest } from "./apiClient";

export const moduleApi = {
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
    })
};
