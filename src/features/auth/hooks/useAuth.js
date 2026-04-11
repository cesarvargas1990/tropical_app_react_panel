import { useState, useCallback, useEffect } from "react";
import { apiLogin, apiValidateToken } from "../services/authService";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_NAME_KEY = "auth_user_name";

function getStorageWithToken() {
  if (localStorage.getItem(AUTH_TOKEN_KEY)) {
    return localStorage;
  }

  if (sessionStorage.getItem(AUTH_TOKEN_KEY)) {
    return sessionStorage;
  }

  return null;
}

function getStoredToken() {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY) ??
    ""
  );
}

function getStoredUserName() {
  return (
    localStorage.getItem(AUTH_USER_NAME_KEY) ??
    sessionStorage.getItem(AUTH_USER_NAME_KEY) ??
    ""
  );
}

function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_NAME_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_NAME_KEY);
}

function persistAuth(token, userName, rememberMe) {
  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const staleStorage = rememberMe ? sessionStorage : localStorage;

  staleStorage.removeItem(AUTH_TOKEN_KEY);
  staleStorage.removeItem(AUTH_USER_NAME_KEY);
  targetStorage.setItem(AUTH_TOKEN_KEY, token);
  targetStorage.setItem(AUTH_USER_NAME_KEY, userName);
}

/**
 * Hook personalizado para manejar autenticación
 * Encapsula toda la lógica de login, logout y estado de autenticación
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!getStoredToken(),
  );
  const [userName, setUserName] = useState(() => getStoredUserName());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storage = getStorageWithToken();
    const token = storage?.getItem(AUTH_TOKEN_KEY) ?? "";

    if (!token) {
      return;
    }

    const storedUserName = String(
      storage?.getItem(AUTH_USER_NAME_KEY) ?? "",
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

        storage?.setItem(AUTH_USER_NAME_KEY, resolvedUserName);
        setUserName(resolvedUserName);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearAuthStorage();
        setUserName("");
        setIsAuthenticated(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const { token, user } = await apiLogin(email, password);
      const resolvedUserName = String(
        user?.name ?? user?.email ?? user?.username ?? "",
      ).trim();

      persistAuth(token, resolvedUserName, rememberMe);
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
    clearAuthStorage();
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
