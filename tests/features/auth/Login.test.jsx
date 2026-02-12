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

  it("stores token and calls onLoginSuccess when credentials are valid", async () => {
    apiLogin.mockResolvedValue("abc123");
    const onLoginSuccess = vi.fn();

    render(<Login onLoginSuccess={onLoginSuccess} />);

    fillFormAndSubmit();

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith("user@test.com", "secret");
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "abc123",
    );
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    expect(swalFireMock).not.toHaveBeenCalled();
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
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});
