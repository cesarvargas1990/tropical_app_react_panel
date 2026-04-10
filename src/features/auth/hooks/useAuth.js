import { useState, useCallback, useEffect } from "react";
import { apiLogin, apiValidateToken } from "../services/authService";

/**
 * Hook personalizado para manejar autenticación
 * Encapsula toda la lógica de login, logout y estado de autenticación
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("auth_token"),
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem("auth_user_name") ?? "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      return;
    }

    const storedUserName = (
      localStorage.getItem("auth_user_name") ?? ""
    ).trim();

    if (storedUserName) {
      return;
    }

    let cancelled = false;

    void apiValidateToken()
      .then(({ valid, user }) => {
        if (cancelled || !valid) {
          return;
        }

        const resolvedUserName = String(
          user?.name ?? user?.email ?? user?.username ?? "",
        ).trim();

        localStorage.setItem("auth_user_name", resolvedUserName);
        setUserName(resolvedUserName);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user_name");
        setUserName("");
        setIsAuthenticated(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const { token, user } = await apiLogin(email, password);
      const resolvedUserName = String(
        user?.name ?? user?.email ?? user?.username ?? "",
      ).trim();

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user_name", resolvedUserName);
      setUserName(resolvedUserName);
      setIsAuthenticated(true);
      return { success: true, token, user };
    } catch (err) {
      const errorMessage = err.message || "Credenciales incorrectas";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user_name");
    setUserName("");
    setIsAuthenticated(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    userName,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
