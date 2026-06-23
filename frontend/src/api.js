const API_BASE_URL = `http://${window.location.hostname}:8080`;

export function apiFetch(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers["X-Auth-Token"] = token;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}
