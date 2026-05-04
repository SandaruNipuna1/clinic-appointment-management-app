const API_ROUTE_SEGMENT = "api";

export function normalizeApiBaseUrl(baseUrl) {
  const trimmedBaseUrl = baseUrl?.trim();

 

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

export async function apiRequest({ baseUrl, token, endpoint, method = "GET", body }) {
  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl);

  if (typeof window !== "undefined") {
    console.log("API request", {
      url: `${normalizedBaseUrl}${endpoint}`,
      method,
      body
    });
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || "Request failed";
    const validationErrors = data?.errors?.map((item) => item.msg).join(", ");
    throw new Error(validationErrors || errorMessage);
  }

  return data;
}
