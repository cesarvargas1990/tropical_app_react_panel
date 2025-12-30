import { describe, it, expect, vi, beforeEach } from "vitest"
import { getLatestSales, registerSale } from "./salesService"
import api from "../services/api"

// 🔒 Mock del api (axios instance)
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe("salesService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getLatestSales", () => {
    it("retorna las ventas recientes cuando la API responde bien", async () => {
      const fakeSales = [
        { id: 1, total: 25000 },
        { id: 2, total: 18000 },
      ]

      api.get.mockResolvedValueOnce({
        data: fakeSales,
      })

      const result = await getLatestSales()

      expect(api.get).toHaveBeenCalledOnce()
      expect(api.get).toHaveBeenCalledWith("/api/sales/latest")
      expect(result).toEqual(fakeSales)
    })

    it("lanza error si la API falla", async () => {
      api.get.mockRejectedValueOnce(new Error("API error"))

      await expect(getLatestSales()).rejects.toThrow()
      expect(api.get).toHaveBeenCalledOnce()
    })
  })

  describe("registerSale", () => {
    it("envía el carrito y retorna la respuesta del backend", async () => {
      const cartItems = [
        { productId: 1, quantity: 2, price: 10000 },
        { productId: 2, quantity: 1, price: 5000 },
      ]

      const fakeResponse = {
        success: true,
        saleId: 99,
      }

      api.post.mockResolvedValueOnce({
        data: fakeResponse,
      })

      const result = await registerSale(cartItems)

      expect(api.post).toHaveBeenCalledOnce()
      expect(api.post).toHaveBeenCalledWith("/api/sales", cartItems)
      expect(result).toEqual(fakeResponse)
    })

    it("lanza error si falla el registro de la venta", async () => {
      const cartItems = [{ productId: 1, quantity: 1 }]

      api.post.mockRejectedValueOnce(new Error("Error al registrar venta"))

      await expect(registerSale(cartItems)).rejects.toThrow()
      expect(api.post).toHaveBeenCalledOnce()
    })
  })
})
