const API_BASE =
  (process.env.REACT_APP_BACKEND_URL || "http://localhost:8010").replace(
    /\/$/,
    ""
  ) + "/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include", // 🔥 CRITICAL for cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json();
}
