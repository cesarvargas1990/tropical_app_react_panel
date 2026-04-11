import axios from "axios";
import Swal from "sweetalert2";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_NAME_KEY = "auth_user_name";

function getStoredToken() {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
}

function clearStoredAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_NAME_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_NAME_KEY);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("⚠ Sesión expirada o token inválido.");

      clearStoredAuth();

      const result = await Swal.fire({
        title: "Sesión expirada",
        text: "Tu sesión ha caducado. Por favor inicia sesión nuevamente.",
        icon: "warning",
        confirmButtonText: "Ir al login",
        confirmButtonColor: "#3B82F6",
        background: "#0f172a",
        color: "#f8fafc",
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = "999999";
        },
      });

      if (result.isConfirmed) {
        window.location.href = "/login";
      }
    }

    console.error("API ERROR:", error.response || error);

    return Promise.reject(error);
  },
);

export default api;
