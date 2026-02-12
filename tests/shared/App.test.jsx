import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useAuth } from "../../src/features/auth";

// Importa el componente real
import App from "../../src/shared/components/App";

// Mock de Login y MainApp (para no depender de sus implementaciones)
vi.mock("../../src/features/auth", () => ({
  useAuth: vi.fn(),
  Login: ({ onLoginSuccess }) => (
    <div>
      <div data-testid="login">LOGIN</div>
      <button onClick={onLoginSuccess}>do-login</button>
    </div>
  ),
}));

vi.mock("../../src/shared/components/MainApp", () => ({
  default: ({ onLogout }) => (
    <div>
      <div data-testid="mainapp">MAINAPP</div>
      <button onClick={onLogout}>do-logout</button>
    </div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza Login si NO está autenticado", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("login")).toBeInTheDocument();
    expect(screen.queryByTestId("mainapp")).toBeNull();
  });

  it("renderiza MainApp si SÍ está autenticado", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("mainapp")).toBeInTheDocument();
    expect(screen.queryByTestId("login")).toBeNull();
  });

  it("logout llama a la función logout del hook", () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<App />);

    fireEvent.click(screen.getByText("do-logout"));

    expect(mockLogout).toHaveBeenCalled();
  });
});
