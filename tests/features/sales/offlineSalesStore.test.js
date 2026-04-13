import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/shared/services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("../../../src/features/cart/services/cartService", () => ({
  clearActiveCart: vi.fn(),
}));

import api from "../../../src/shared/services/api";
import {
  cacheLatestSales,
  getSalesEventName,
  mergeSalesWithPending,
  queuePendingSale,
  readCachedLatestSales,
  rememberSaleLocally,
  syncPendingSales,
} from "../../../src/features/sales/services/offlineSalesStore";
import { clearActiveCart } from "../../../src/features/cart/services/cartService";

describe("offlineSalesStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("guarda ventas pendientes en cache local y las marca como no sincronizadas", () => {
    const eventSpy = vi.fn();
    window.addEventListener(getSalesEventName(), eventSpy);

    queuePendingSale([
      {
        productMatrixId: 10,
        quantity: 2,
        unitPrice: 5000,
        subtotal: 10000,
        flavor: "Mango",
        feature: "Clasico",
        sizeLabel: "L",
        machineName: "Maquina 1",
      },
    ]);

    const sales = readCachedLatestSales();

    expect(sales).toHaveLength(1);
    expect(sales[0]).toEqual(
      expect.objectContaining({
        machine: "Maquina 1",
        flavor: "Mango",
        feature: "Clasico",
        size: "L",
        quantity: 2,
        __unsynced: true,
        __offline: true,
      }),
    );
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener(getSalesEventName(), eventSpy);
  });

  it("fusiona ventas servidor y pendientes sin duplicar coincidencias", () => {
    const pending = [
      {
        id: "pending-1",
        createdAt: "2026-04-13T10:00:00.000Z",
        items: [
          {
            productMatrixId: 1,
            quantity: 1,
            flavor: "Mango",
            feature: "Clasico",
            sizeLabel: "M",
            machineName: "Maquina 1",
          },
        ],
      },
    ];

    const merged = mergeSalesWithPending(
      [
        {
          id: 99,
          machine: "Maquina 1",
          flavor: "Mango",
          feature: "Clasico",
          size: "M",
          quantity: 1,
          date: "2026-04-13T10:00:00.000Z",
        },
        {
          id: 100,
          machine: "Maquina 2",
          flavor: "Lulo",
          feature: "",
          size: "L",
          quantity: 1,
          date: "2026-04-13T09:00:00.000Z",
        },
      ],
      pending,
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].__unsynced).toBe(true);
    expect(merged[1]).toEqual(
      expect.objectContaining({
        id: 100,
        machine: "Maquina 2",
      }),
    );
  });

  it("sincroniza pendientes y los deja visibles como sincronizados", async () => {
    api.post.mockResolvedValue({ data: { success: true, venta_id: 501 } });

    queuePendingSale([
      {
        productMatrixId: 10,
        quantity: 1,
        unitPrice: 5000,
        subtotal: 5000,
        flavor: "Mango",
        sizeLabel: "L",
        machineName: "Maquina 1",
      },
    ]);

    const result = await syncPendingSales();
    const sales = readCachedLatestSales();

    expect(result).toEqual({ synced: 1, remaining: 0 });
    expect(api.post).toHaveBeenCalledWith(
      "/api/sales",
      expect.objectContaining({
        offline: true,
        items: expect.arrayContaining([
          expect.objectContaining({
            productMatrixId: 10,
            quantity: 1,
          }),
        ]),
      }),
    );
    expect(sales[0]).toEqual(
      expect.objectContaining({
        __unsynced: false,
        __offline: true,
        machine: "Maquina 1",
      }),
    );
  });

  it("recuerda ventas normales en cache para verlas sin internet", () => {
    rememberSaleLocally([
      {
        productMatrixId: 15,
        quantity: 1,
        productName: "Granizado",
        flavor: "Maracuya",
        feature: "Frozen",
        sizeLabel: "S",
        machineName: "Tanque 2",
      },
    ]);

    const sales = readCachedLatestSales();

    expect(sales[0]).toEqual(
      expect.objectContaining({
        machine: "Tanque 2",
        flavor: "Maracuya",
        __unsynced: false,
        __offline: false,
        date: expect.stringMatching(
          /^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s+(AM|PM)$/,
        ),
      }),
    );
  });

  it("reconstruye las ventas pendientes desde la cola aunque el cache visible este vacio", () => {
    queuePendingSale([
      {
        productMatrixId: 31,
        quantity: 1,
        unitPrice: 4000,
        subtotal: 4000,
        flavor: "Mora",
        feature: "Frozen",
        sizeLabel: "M",
        machineName: "Tanque 9",
      },
    ]);

    window.localStorage.removeItem("tropical.latestSales.cache.v1");

    const sales = readCachedLatestSales();

    expect(sales).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          machine: "Tanque 9",
          flavor: "Mora",
          __unsynced: true,
          __offline: true,
        }),
      ]),
    );
  });

  it("limpia el carrito servidor al sincronizar ventas offline nacidas del carro backend", async () => {
    api.post.mockResolvedValue({ data: { success: true, venta_id: 777 } });
    clearActiveCart.mockResolvedValue({ ok: true });

    queuePendingSale(
      [
        {
          productMatrixId: 20,
          quantity: 1,
          unitPrice: 5000,
          subtotal: 5000,
          flavor: "Lulo",
          sizeLabel: "M",
          machineName: "Maquina 5",
        },
      ],
      {
        deviceId: "tablet-1",
        clearServerCartAfterSync: true,
      },
    );

    await syncPendingSales();

    expect(clearActiveCart).toHaveBeenCalledWith({
      deviceId: "tablet-1",
    });
  });

  it("preserva los pendientes que no pudieron sincronizarse", async () => {
    api.post
      .mockResolvedValueOnce({ data: { success: true, venta_id: 501 } })
      .mockRejectedValueOnce(new Error("Network Error"));

    queuePendingSale([
      {
        productMatrixId: 10,
        quantity: 1,
        unitPrice: 5000,
        subtotal: 5000,
        flavor: "Mango",
        sizeLabel: "L",
        machineName: "Maquina 1",
      },
    ]);
    queuePendingSale([
      {
        productMatrixId: 11,
        quantity: 1,
        unitPrice: 6000,
        subtotal: 6000,
        flavor: "Lulo",
        sizeLabel: "M",
        machineName: "Maquina 2",
      },
    ]);

    const result = await syncPendingSales();
    const sales = readCachedLatestSales();

    expect(result).toEqual({ synced: 1, remaining: 1 });
    expect(sales.some((sale) => sale.__unsynced)).toBe(true);
  });

  it("cachea ventas remotas y preserva filas locales relevantes", () => {
    queuePendingSale([
      {
        productMatrixId: 10,
        quantity: 1,
        unitPrice: 5000,
        subtotal: 5000,
        flavor: "Mango",
        sizeLabel: "L",
        machineName: "Maquina 1",
      },
    ]);

    cacheLatestSales([
      {
        id: 100,
        machine: "Servidor 1",
        flavor: "Fresa",
        feature: "",
        size: "S",
        quantity: 1,
        date: "2026-04-13T08:00:00.000Z",
      },
    ]);

    const sales = readCachedLatestSales();

    expect(sales).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ machine: "Servidor 1" }),
        expect.objectContaining({ machine: "Maquina 1", __unsynced: true }),
      ]),
    );
  });
});
