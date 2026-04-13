export async function apiRequest({ baseUrl, token, endpoint, method = "GET", body }) {
  if (typeof window !== "undefined") {
    console.log("API request", {
      url: `${baseUrl}${endpoint}`,
      method,
      body
    });
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
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
