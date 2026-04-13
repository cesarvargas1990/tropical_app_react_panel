import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getLatestSales,
  registerSale,
} from "../../../src/features/sales/services/salesService";
import api from "../../../src/shared/services/api";
import {
  checkoutCart,
  clearActiveCart,
} from "../../../src/features/cart/services/cartService";
import {
  cacheLatestSales,
  queuePendingSale,
  readCachedLatestSales,
  registerSaleDirect,
} from "../../../src/features/sales/services/offlineSalesStore";

vi.mock("../../../src/shared/services/deviceId", () => ({
  getDeviceId: vi.fn(() => "tablet-test"),
  createMutationId: vi.fn(() => "mutation-test"),
}));

vi.mock("../../../src/shared/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../../src/features/cart/services/cartService", () => ({
  checkoutCart: vi.fn(),
  clearActiveCart: vi.fn(),
}));

vi.mock("../../../src/features/sales/services/offlineSalesStore", () => ({
  cacheLatestSales: vi.fn(),
  queuePendingSale: vi.fn(),
  readCachedLatestSales: vi.fn(() => []),
  registerSaleDirect: vi.fn(),
  syncPendingSales: vi.fn(),
}));

describe("salesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("navigator", {
      onLine: true,
    });
  });

  describe("getLatestSales", () => {
    it("usa la API, actualiza cache y retorna lo visible desde cache", async () => {
      const serverSales = [{ id: 1, machine: "A1" }];
      const cachedSales = [
        { id: 1, machine: "A1" },
        { id: "pending-2", machine: "A2", __unsynced: true },
      ];

      api.get.mockResolvedValueOnce({ data: serverSales });
      readCachedLatestSales.mockReturnValueOnce(cachedSales);

      const result = await getLatestSales();

      expect(api.get).toHaveBeenCalledWith("/api/sales/latest");
      expect(cacheLatestSales).toHaveBeenCalledWith(serverSales);
      expect(result).toEqual(cachedSales);
    });

    it("retorna cache local si falla por red", async () => {
      const cachedSales = [{ id: "cached-1", machine: "A1" }];
      api.get.mockRejectedValueOnce(new Error("Network Error"));
      readCachedLatestSales.mockReturnValueOnce(cachedSales);

      const result = await getLatestSales();

      expect(cacheLatestSales).not.toHaveBeenCalled();
      expect(result).toEqual(cachedSales);
    });

    it("relanza errores no asociados a red", async () => {
      api.get.mockRejectedValueOnce({
        response: {
          status: 500,
        },
      });

      await expect(getLatestSales()).rejects.toEqual({
        response: {
          status: 500,
        },
      });
    });
  });

  describe("registerSale", () => {
    const cartItems = [
      {
        productMatrixId: 12,
        quantity: 2,
        unitPrice: 6000,
        subtotal: 12000,
      },
    ];

    it("encola la venta cuando no hay internet", async () => {
      navigator.onLine = false;

      const result = await registerSale(cartItems);

      expect(queuePendingSale).toHaveBeenCalledWith(cartItems);
      expect(checkoutCart).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        pending: true,
        shouldSyncCart: false,
        mode: "queued",
      });
    });

    it("usa checkout cuando el carrito sigue en backend", async () => {
      checkoutCart.mockResolvedValueOnce({ success: true, venta_id: 77 });

      const result = await registerSale(cartItems);

      expect(checkoutCart).toHaveBeenCalledWith({
        deviceId: "tablet-test",
      });
      expect(result).toEqual({
        success: true,
        venta_id: 77,
        pending: false,
        shouldSyncCart: true,
        mode: "checkout",
      });
    });

    it("usa registro directo y limpia carrito servidor cuando hay items locales", async () => {
      registerSaleDirect.mockResolvedValueOnce({ success: true, venta_id: 88 });
      clearActiveCart.mockResolvedValueOnce({ ok: true });

      const result = await registerSale(cartItems, {
        hasLocalOnlyItems: true,
      });

      expect(registerSaleDirect).toHaveBeenCalledWith(cartItems);
      expect(clearActiveCart).toHaveBeenCalledWith({
        deviceId: "tablet-test",
      });
      expect(result).toEqual({
        success: true,
        venta_id: 88,
        pending: false,
        shouldSyncCart: true,
        mode: "direct-api",
      });
    });

    it("encola la venta si el checkout falla por red", async () => {
      checkoutCart.mockRejectedValueOnce(new Error("Network Error"));

      const result = await registerSale(cartItems);

      expect(queuePendingSale).toHaveBeenCalledWith(cartItems);
      expect(result.pending).toBe(true);
      expect(result.mode).toBe("queued");
    });

    it("relanza errores funcionales del backend", async () => {
      checkoutCart.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: "Venta inválida" },
        },
      });

      await expect(registerSale(cartItems)).rejects.toEqual({
        response: {
          status: 422,
          data: { message: "Venta inválida" },
        },
      });
    });
  });
});
