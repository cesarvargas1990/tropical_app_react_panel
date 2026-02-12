import { useState, useCallback } from "react";
import { apiLogin } from "../services/authService";

/**
 * Hook personalizado para manejar autenticación
 * Encapsula toda la lógica de login, logout y estado de autenticación
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("auth_token"),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await apiLogin(email, password);
      localStorage.setItem("auth_token", token);
      setIsAuthenticated(true);
      return { success: true, token };
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
    setIsAuthenticated(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
