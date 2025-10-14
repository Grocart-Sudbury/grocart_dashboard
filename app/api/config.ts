// api/config.ts
//export const API_BASE_URL = "http://212.38.95.84:9091/api";
export const API_BASE_URL = "https://api.grocartinc.ca/api";
//export const API_BASE_URL = "http://localhost:9091/api";
/**
 * Global fetch helper that automatically adds Basic Auth using localStorage credentials
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const username = localStorage.getItem("username") || "";
  const password = localStorage.getItem("password") || "";

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (username && password) {
    headers.set("Authorization", "Basic " + btoa(`${username}:${password}`));
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  return data;
}
