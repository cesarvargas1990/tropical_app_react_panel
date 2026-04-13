import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProducts } from "../../../src/features/products/services/productsService";
import { getDirectAccessProductsConfig } from "../../../src/features/products/services/directAccessProductsService";
import api from "../../../src/shared/services/api";
import { writeJsonStorage } from "../../../src/shared/services/localStorage";

// 🔒 Mock completo del api (axios instance)
vi.mock("../../../src/shared/services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("productsService - getProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("retorna los productos cuando la API responde correctamente", async () => {
    const fakeProducts = [
      { id: 1, name: "Producto 1" },
      { id: 2, name: "Producto 2" },
    ];

    api.get.mockResolvedValueOnce({
      data: fakeProducts,
    });

    const result = await getProducts();

    expect(api.get).toHaveBeenCalledOnce();
    expect(api.get).toHaveBeenCalledWith("/api/products");
    expect(result).toEqual(fakeProducts);
  });

  it("lanza error si la API falla y no existe cache local", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"));

    await expect(getProducts()).rejects.toThrow();
    expect(api.get).toHaveBeenCalledOnce();
  });

  it("retorna cache local si la API falla por red y ya habia productos guardados", async () => {
    const cachedProducts = [
      { id: 1, name: "Producto 1" },
      { id: 2, name: "Producto 2" },
    ];
    writeJsonStorage("tropical.products.cache.v1", cachedProducts);
    api.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await getProducts();

    expect(result).toEqual(cachedProducts);
  });

  it("retorna la configuracion de acceso directo", async () => {
    api.get.mockResolvedValueOnce({
      data: { productMatrixIds: [334, 336, 338] },
    });

    const result = await getDirectAccessProductsConfig();

    expect(api.get).toHaveBeenCalledWith("/api/products/direct-access");
    expect(result).toEqual({ productMatrixIds: [334, 336, 338] });
  });
});
