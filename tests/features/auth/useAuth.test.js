import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../../../src/features/auth/hooks/useAuth";
import * as authService from "../../../src/features/auth/services/authService";

vi.mock("../../../src/features/auth/services/authService");

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    authService.apiValidateToken?.mockReset?.();
  });

  it("inicializa sin autenticación si no hay token", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("inicializa autenticado si hay token en localStorage", () => {
    localStorage.setItem("auth_token", "token-123");
    localStorage.setItem("auth_user_name", "Cesar");
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("inicializa autenticado si hay token en sessionStorage", () => {
    sessionStorage.setItem("auth_token", "token-session");
    sessionStorage.setItem("auth_user_name", "Cesar Session");
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userName).toBe("Cesar Session");
  });

  it("hidrata el nombre del usuario desde validate-token cuando falta en storage", async () => {
    sessionStorage.setItem("auth_token", "token-123");
    authService.apiValidateToken.mockResolvedValue({
      valid: true,
      user: { name: "Cesar" },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {});

    expect(authService.apiValidateToken).toHaveBeenCalledTimes(1);
    expect(result.current.userName).toBe("Cesar");
    expect(sessionStorage.getItem("auth_user_name")).toBe("Cesar");
  });

  it("login exitoso con recordarme guarda en localStorage", async () => {
    authService.apiLogin.mockResolvedValue({
      token: "token-abc",
      user: { id: 7, name: "Cesar" },
    });
    const { result } = renderHook(() => useAuth());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login(
        "test@test.com",
        "password",
        true,
      );
    });

    expect(loginResult.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userName).toBe("Cesar");
    expect(localStorage.getItem("auth_token")).toBe("token-abc");
    expect(localStorage.getItem("auth_user_name")).toBe("Cesar");
    expect(sessionStorage.getItem("auth_token")).toBeNull();
  });

  it("login exitoso sin recordarme guarda en sessionStorage", async () => {
    authService.apiLogin.mockResolvedValue({
      token: "token-session",
      user: { id: 8, name: "Ana" },
    });
    const { result } = renderHook(() => useAuth());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login(
        "ana@test.com",
        "password",
        false,
      );
    });

    expect(loginResult.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userName).toBe("Ana");
    expect(sessionStorage.getItem("auth_token")).toBe("token-session");
    expect(sessionStorage.getItem("auth_user_name")).toBe("Ana");
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("login fallido maneja el error", async () => {
    authService.apiLogin.mockRejectedValue(
      new Error("Credenciales incorrectas"),
    );
    const { result } = renderHook(() => useAuth());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login("test@test.com", "wrong");
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe("Credenciales incorrectas");
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("logout limpia localStorage y sessionStorage", () => {
    localStorage.setItem("auth_token", "token-123");
    localStorage.setItem("auth_user_name", "Cesar");
    sessionStorage.setItem("auth_token", "token-session");
    sessionStorage.setItem("auth_user_name", "Ana");
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user_name")).toBeNull();
    expect(sessionStorage.getItem("auth_token")).toBeNull();
    expect(sessionStorage.getItem("auth_user_name")).toBeNull();
    expect(result.current.userName).toBe("");
  });

  it("clearError limpia el mensaje de error", async () => {
    authService.apiLogin.mockRejectedValue(new Error("Error test"));
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login("test@test.com", "wrong");
    });

    expect(result.current.error).toBe("Error test");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
