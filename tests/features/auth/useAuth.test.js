import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../../../src/features/auth/hooks/useAuth";
import * as authService from "../../../src/features/auth/services/authService";

vi.mock("../../../src/features/auth/services/authService");

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("inicializa sin autenticación si no hay token", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("inicializa autenticado si hay token en localStorage", () => {
    localStorage.setItem("auth_token", "token-123");
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("login exitoso actualiza el estado", async () => {
    authService.apiLogin.mockResolvedValue("token-abc");
    const { result } = renderHook(() => useAuth());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login("test@test.com", "password");
    });

    expect(loginResult.success).toBe(true);
    expect(loginResult.token).toBe("token-abc");
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("auth_token")).toBe("token-abc");
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

  it("logout limpia el token y actualiza estado", () => {
    localStorage.setItem("auth_token", "token-123");
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
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
