import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSizes } from "../../../src/features/products/services/sizesService";
import api from "../../../src/shared/services/api";

// 🔒 Mock del api (axios instance)
vi.mock("../../../src/shared/services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("sizesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna los tamaños cuando la API responde correctamente", async () => {
    const fakeSizes = [
      { id: 1, nombre: "Pequeño" },
      { id: 2, nombre: "Mediano" },
      { id: 3, nombre: "Grande" },
    ];

    api.get.mockResolvedValueOnce({
      data: fakeSizes,
    });

    const result = await getSizes();

    expect(api.get).toHaveBeenCalledOnce();
    expect(api.get).toHaveBeenCalledWith("api/sizes");
    expect(result).toEqual(fakeSizes);
  });

  it("retorna un arreglo vacío y loguea error si la API falla", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    api.get.mockRejectedValueOnce(new Error("Network error"));

    const result = await getSizes();

    expect(api.get).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
