const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.8.191:5001/api";

const parseJson = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = data?.errors?.map((item) => item.msg).join(", ");
    throw new Error(validationErrors || data?.message || "Request failed");
  }

  return data;
};

const request = async ({ endpoint, method = "GET", token, body, baseUrl = DEFAULT_API_BASE_URL }) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return parseJson(response);
};

export const authApi = {
  signup: ({ payload, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/signup",
      method: "POST",
      body: payload
    }),

  login: ({ payload, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/login",
      method: "POST",
      body: payload
    }),

  getProfile: ({ token, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/me",
      token
    }),

  updateProfile: ({ token, payload, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/me",
      method: "PATCH",
      token,
      body: payload
    })
};
