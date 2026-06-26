import axios from "axios";

const TOKEN_KEY = "alp_access_token";

export const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData must not use application/json — axios sets multipart boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Only force logout on 401 from the auth service (invalid/expired session).
// Resource/AI services may return 401 for config issues — let pages show errors instead.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    if (status === 401 && url.includes("/api/auth/")) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
