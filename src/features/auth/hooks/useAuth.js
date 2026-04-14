import { useState, useCallback, useEffect } from "react";
import { apiLogin, apiValidateToken } from "../services/authService";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_NAME_KEY = "auth_user_name";

function sanitizeUserName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

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
  return sanitizeUserName(
    localStorage.getItem(AUTH_USER_NAME_KEY) ??
      sessionStorage.getItem(AUTH_USER_NAME_KEY) ??
      "",
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
  const safeUserName = sanitizeUserName(userName);

  staleStorage.removeItem(AUTH_TOKEN_KEY);
  staleStorage.removeItem(AUTH_USER_NAME_KEY);
  targetStorage.setItem(AUTH_TOKEN_KEY, token);
  targetStorage.setItem(AUTH_USER_NAME_KEY, safeUserName);
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

    const storedUserName = sanitizeUserName(
      storage?.getItem(AUTH_USER_NAME_KEY) ?? "",
    );

    if (storedUserName) {
      return;
    }

    let cancelled = false;

    void apiValidateToken()
      .then(({ valid, user }) => {
        if (cancelled || !valid) {
          return;
        }

        const resolvedUserName = sanitizeUserName(
          user?.name ?? user?.email ?? user?.username ?? "",
        );

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
      const resolvedUserName = sanitizeUserName(
        user?.name ?? user?.email ?? user?.username ?? "",
      );

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
