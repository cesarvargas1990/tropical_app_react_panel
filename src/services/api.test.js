import { describe, it, expect, vi, beforeEach } from "vitest"

// --- refs singleton para capturar interceptors ---
const requestUse = vi.fn()
const responseUse = vi.fn()

// Mock axios COMPLETO: cero llamadas reales
vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })),
    },
  }
})

// Mock SweetAlert (sin implementación fija)
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    getContainer: vi.fn(() => ({ style: {} })),
  },
}))

describe("api axios instance", () => {
  let requestInterceptor
  let responseErrorInterceptor

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules() // ✅ CRÍTICO: fuerza a que ./api se vuelva a ejecutar

    // mock localStorage (incluye setItem para que no explote)
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }

    // mock window.location (read-only en JSDOM)
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    })

    // ✅ importar DESPUÉS del resetModules (esto registra interceptors)
    await import("./api.js")

    // capturar interceptores registrados
    expect(requestUse).toHaveBeenCalledTimes(1)
    expect(responseUse).toHaveBeenCalledTimes(1)

    requestInterceptor = requestUse.mock.calls[0][0]
    responseErrorInterceptor = responseUse.mock.calls[0][1]

    // blindar Swal para este test file (por si otros tests lo ensucian)
    const Swal = (await import("sweetalert2")).default
    Swal.fire.mockReset()
    Swal.getContainer.mockReset()
    Swal.getContainer.mockImplementation(() => ({ style: {} }))
  })

  it("NO agrega Authorization header si no hay token", async () => {
    localStorage.getItem.mockReturnValue(null)

    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBeUndefined()
  })

  it("agrega Authorization header si existe auth_token", async () => {
    localStorage.getItem.mockReturnValue("token-123")

    const config = { headers: {} }
    const result = requestInterceptor(config)

    expect(result.headers.Authorization).toBe("Bearer token-123")
  })

  

  it("no hace nada especial para errores != 401", async () => {
    const Swal = (await import("sweetalert2")).default
    const error = { response: { status: 500 } }

    await expect(responseErrorInterceptor(error)).rejects.toBe(error)

    expect(localStorage.removeItem).not.toHaveBeenCalled()
    expect(Swal.fire).not.toHaveBeenCalled()
    expect(window.location.href).toBe("")
  })

  it("para status 401 limpia token, muestra alerta y redirige tras confirmar", async () => {
    const Swal = (await import("sweetalert2")).default
    const container = { style: {} }
    Swal.getContainer.mockReturnValue(container)
    Swal.fire.mockImplementation(async (options) => {
      options?.didOpen?.()
      return { isConfirmed: true }
    })

    const error = { response: { status: 401 } }

    await expect(responseErrorInterceptor(error)).rejects.toBe(error)

    expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token")
    expect(Swal.fire).toHaveBeenCalledTimes(1)
    expect(Swal.getContainer).toHaveBeenCalled()
    expect(container.style.zIndex).toBe("999999")
    expect(window.location.href).toBe("/login")
  })
})
