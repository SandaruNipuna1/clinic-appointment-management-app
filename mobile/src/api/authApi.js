// This file handles API requests related to user authentication.
// It includes functions for signing up, logging in, and managing user profiles.

import { normalizeApiBaseUrl } from "./apiClient";

const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// This helper function processes the response from the server.
// It checks if the request was successful and extracts the data or throws an error.
const parseJson = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = data?.errors?.map((item) => item.msg).join(", ");
    throw new Error(validationErrors || data?.message || "Request failed");
  }

  return data;
};

// This function makes a request to the auth API endpoints.
// It sets up the headers, including authentication if a token is provided.
const request = async ({ endpoint, method = "GET", token, body, baseUrl = DEFAULT_API_BASE_URL }) => {
  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    throw new Error("API base URL is not configured");
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${normalizedBaseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return parseJson(response);
};

// This object contains functions for authentication-related API calls.
export const authApi = {
  // Function to create a new user account
  signup: ({ payload, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/signup",
      method: "POST",
      body: payload
    }),

  // Function to log in an existing user
  login: ({ payload, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/login",
      method: "POST",
      body: payload
    }),

  // Function to get the current user's profile information
  getProfile: ({ token, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/me",
      token
    }),

  // Function to update the current user's profile
  updateProfile: ({ token, payload, baseUrl }) =>
    request({
      baseUrl,
      endpoint: "/auth/me",
      method: "PATCH",
      token,
      body: payload
    })
};
