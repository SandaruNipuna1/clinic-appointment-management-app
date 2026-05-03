// This file provides helper functions for making requests to the backend API.
// It ensures the server URL is formatted correctly and handles authentication and errors.

const API_ROUTE_SEGMENT = "api";

// This function makes sure the base URL for the API is correct.
// It adds "/api" to the end if it's not already there, so requests go to the right place.
export function normalizeApiBaseUrl(baseUrl) {
  const trimmedBaseUrl = baseUrl?.trim();

  if (!trimmedBaseUrl) {
    return "";
  }

  const withoutTrailingSlash = trimmedBaseUrl.replace(/\/+$/, "");

  try {
    const url = new URL(withoutTrailingSlash);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const apiSegmentIndex = pathParts.indexOf(API_ROUTE_SEGMENT);

    if (apiSegmentIndex >= 0) {
      url.pathname = `/${pathParts.slice(0, apiSegmentIndex + 1).join("/")}`;
    } else {
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/${API_ROUTE_SEGMENT}`;
    }

    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/+$/, "");
  } catch (error) {
    const apiPathMatch = withoutTrailingSlash.match(/^(.*?\/api)(?:\/.*)?$/);

    return apiPathMatch ? apiPathMatch[1] : `${withoutTrailingSlash}/${API_ROUTE_SEGMENT}`;
  }
}

// This function makes a request to the API server.
// It includes the user's token for authentication if provided, and handles errors.
export async function apiRequest({ baseUrl, token, endpoint, method = "GET", body }) {
  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl);

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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || "Request failed";
    const validationErrors = data?.errors?.map((item) => item.msg).join(", ");
    throw new Error(validationErrors || errorMessage);
  }

  return data;
}
