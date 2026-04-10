import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================================
      INTERCEPTOR REQUEST
   AGREGA TOKEN DE LOCALSTORAGE
================================ */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================================
   INTERCEPTOR RESPONSE
   CAPTURA 401 → TOKEN EXPIRADO
========================================= */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;

    // Token expirado / inválido
    if (status === 401) {
      console.warn("⚠ Sesión expirada o token inválido.");

      // borrar token viejo
      localStorage.removeItem("auth_token");

      // mensaje visual
      //alert("Tu sesión expiró. Inicia sesión nuevamente.");

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

      // redirección al login
      //window.location.href = "/login";
    }

    // log controlado
    console.error("API ERROR:", error.response || error);

    return Promise.reject(error);
  },
);

export default api;
