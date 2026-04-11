import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Login } from "../../../src/features/auth/components/Login";
import { apiLogin } from "../../../src/features/auth/services/authService";

const { swalFireMock } = vi.hoisted(() => ({
  swalFireMock: vi.fn(),
}));

vi.mock("../../../src/features/auth/services/authService", () => ({
  apiLogin: vi.fn(),
}));

vi.mock("sweetalert2", () => ({
  default: {
    fire: swalFireMock,
  },
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_APP_VERSION", "3.2.1");
    swalFireMock.mockReset();

    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  const fillFormAndSubmit = (email = "user@test.com", password = "secret") => {
    fireEvent.change(screen.getByPlaceholderText("Correo"), {
      target: { value: email },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: password },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
  };

  it("shows app version below the login title", () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.getByText("v 3.2.1")).toBeInTheDocument();
  });

  it("shows the remember me checkbox", () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    expect(screen.getByLabelText("Recordarme")).toBeInTheDocument();
  });

  it("stores token in localStorage when remember me is checked", async () => {
    apiLogin.mockResolvedValue({
      token: "abc123",
      user: {
        name: "Cesar",
      },
    });
    const onLoginSuccess = vi.fn();

    render(<Login onLoginSuccess={onLoginSuccess} />);

    fireEvent.click(screen.getByLabelText("Recordarme"));
    fillFormAndSubmit();

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith("user@test.com", "secret");
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "abc123",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "auth_user_name",
      "Cesar",
    );
    expect(window.sessionStorage.setItem).not.toHaveBeenCalledWith(
      "auth_token",
      "abc123",
    );
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    expect(swalFireMock).not.toHaveBeenCalled();
  });

  it("stores token in sessionStorage when remember me is not checked", async () => {
    apiLogin.mockResolvedValue({
      token: "session-123",
      user: {
        name: "Ana",
      },
    });

    render(<Login onLoginSuccess={vi.fn()} />);

    fillFormAndSubmit("ana@test.com", "secret");

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith("ana@test.com", "secret");
    });

    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "session-123",
    );
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      "auth_user_name",
      "Ana",
    );
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      "auth_token",
      "session-123",
    );
  });

  it("shows an alert when apiLogin rejects", async () => {
    apiLogin.mockRejectedValue(new Error("Credenciales incorrectas"));
    const onLoginSuccess = vi.fn();

    render(<Login onLoginSuccess={onLoginSuccess} />);
    fillFormAndSubmit("fail@test.com", "wrong");

    await waitFor(() => {
      expect(swalFireMock).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Error",
        }),
      );
    });

    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});
