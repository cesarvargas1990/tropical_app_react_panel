import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

// Importa el componente real
import App from "./App"

// Mock de Login y MainApp (para no depender de sus implementaciones)
vi.mock("./Login", () => ({
  Login: ({ onLoginSuccess }) => (
    <div>
      <div data-testid="login">LOGIN</div>
      <button onClick={onLoginSuccess}>do-login</button>
    </div>
  ),
}))

vi.mock("./MainApp", () => ({
  default: ({ onLogout }) => (
    <div>
      <div data-testid="mainapp">MAINAPP</div>
      <button onClick={onLogout}>do-logout</button>
    </div>
  ),
}))

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    // mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
      configurable: true,
    })
  })

  it("renderiza Login si NO hay auth_token", () => {
    window.localStorage.getItem.mockReturnValue(null)

    render(<App />)

    expect(screen.getByTestId("login")).toBeInTheDocument()
    expect(screen.queryByTestId("mainapp")).toBeNull()
  })

  it("renderiza MainApp si SÍ hay auth_token", () => {
    window.localStorage.getItem.mockReturnValue("token-123")

    render(<App />)

    expect(screen.getByTestId("mainapp")).toBeInTheDocument()
    expect(screen.queryByTestId("login")).toBeNull()
  })

  it("si Login dispara onLoginSuccess → cambia a MainApp", () => {
    window.localStorage.getItem.mockReturnValue(null)

    render(<App />)

    expect(screen.getByTestId("login")).toBeInTheDocument()

    fireEvent.click(screen.getByText("do-login"))

    expect(screen.getByTestId("mainapp")).toBeInTheDocument()
    expect(screen.queryByTestId("login")).toBeNull()
  })

  it("si MainApp dispara onLogout → vuelve a Login", () => {
    window.localStorage.getItem.mockReturnValue("token-123")

    render(<App />)

    expect(screen.getByTestId("mainapp")).toBeInTheDocument()

    fireEvent.click(screen.getByText("do-logout"))

    expect(screen.getByTestId("login")).toBeInTheDocument()
    expect(screen.queryByTestId("mainapp")).toBeNull()
  })
})
