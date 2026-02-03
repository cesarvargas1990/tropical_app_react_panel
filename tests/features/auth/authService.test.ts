import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { apiLogin } from '../../../src/features/auth/services/authService';

// Mock de axios COMPLETO (no hace llamadas reales)
vi.mock("axios")

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>
}

describe("authService - apiLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna el token cuando las credenciales son correctas", async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {
        token: "fake-jwt-token",
      },
    })

    const token = await apiLogin("test@mail.com", "123456")

    expect(mockedAxios.post).toHaveBeenCalledOnce()
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${import.meta.env.VITE_BACKEND_URL}/api/login`,
      {
        email: "test@mail.com",
        password: "123456",
      }
    )

    expect(token).toBe("fake-jwt-token")
  })

  it("lanza error si el servidor no devuelve token", async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {},
    })

    await expect(
      apiLogin("test@mail.com", "123456")
    ).rejects.toThrow("Credenciales incorrectas")
  })

  it("lanza error si axios falla (credenciales incorrectas)", async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error("401"))

    await expect(
      apiLogin("test@mail.com", "bad-password")
    ).rejects.toThrow("Credenciales incorrectas")
  })
})
