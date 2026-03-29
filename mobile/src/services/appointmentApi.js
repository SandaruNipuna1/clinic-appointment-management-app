const API_BASE_URL = "http://192.168.8.191:5001/api/appointments";

const parseResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Request failed"
    };
  }

  return data;
};

export const fetchAppointments = async () => {
  const response = await fetch(API_BASE_URL);
  return parseResponse(response);
};

export const createAppointment = async (payload) => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};

export const cancelAppointment = async (appointmentId) => {
  const response = await fetch(`${API_BASE_URL}/${appointmentId}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    }
  });

  return parseResponse(response);
};

export const updateAppointment = async (appointmentId, payload) => {
  const response = await fetch(`${API_BASE_URL}/${appointmentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};
