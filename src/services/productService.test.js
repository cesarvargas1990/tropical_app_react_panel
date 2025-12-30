import { describe, it, expect, vi, beforeEach } from "vitest"
import { getProducts } from "./productsService"
import api from "../services/api"

// 🔒 Mock completo del api (axios instance)
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}))

describe("productsService - getProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna los productos cuando la API responde correctamente", async () => {
    const fakeProducts = [
      { id: 1, name: "Producto 1" },
      { id: 2, name: "Producto 2" },
    ]

    api.get.mockResolvedValueOnce({
      data: fakeProducts,
    })

    const result = await getProducts()

    expect(api.get).toHaveBeenCalledOnce()
    expect(api.get).toHaveBeenCalledWith("/api/products")
    expect(result).toEqual(fakeProducts)
  })

  it("lanza error si la API falla", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"))

    await expect(getProducts()).rejects.toThrow()
    expect(api.get).toHaveBeenCalledOnce()
  })
})
