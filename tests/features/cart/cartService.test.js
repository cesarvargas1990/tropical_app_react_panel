import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/shared/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../src/shared/services/deviceId", () => ({
  getDeviceId: vi.fn(() => "device-default"),
  createMutationId: vi.fn(() => "mutation-default"),
}));

import api from "../../../src/shared/services/api";
import {
  addCartItems,
  checkoutCart,
  clearActiveCart,
  getActiveCart,
  removeCartItem,
  scanCartItem,
} from "../../../src/features/cart/services/cartService";

describe("cartService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the active cart using the provided device id", async () => {
    api.get.mockResolvedValue({ data: { data: { cart: { id: 7 } } } });

    await expect(getActiveCart("device-7")).resolves.toEqual({ id: 7 });
    expect(api.get).toHaveBeenCalledWith("/api/cart/active", {
      params: { device_id: "device-7" },
    });
  });

  it("scans a cart item and unwraps flat payloads", async () => {
    api.post.mockResolvedValue({ data: { cart: { id: 8, items: [1] } } });

    await expect(
      scanCartItem({ productMatrixId: 14, barcode: "ABC123" }),
    ).resolves.toEqual({ id: 8, items: [1] });
    expect(api.post).toHaveBeenCalledWith("/api/cart/active/items/scan", {
      device_id: "device-default",
      productMatrixId: 14,
      barcode: "ABC123",
      mutation_uuid: "mutation-default",
    });
  });

  it("adds cart items with manual source by default", async () => {
    api.post.mockResolvedValue({ data: { data: { cart: { id: 9 } } } });

    await expect(
      addCartItems({ items: [{ size_id: 3, quantity: 2 }] }),
    ).resolves.toEqual({
      id: 9,
    });
    expect(api.post).toHaveBeenCalledWith("/api/cart/active/items", {
      device_id: "device-default",
      source: "manual",
      mutation_uuid: "mutation-default",
      items: [{ size_id: 3, quantity: 2 }],
    });
  });

  it("removes and clears cart items with delete payloads", async () => {
    api.delete
      .mockResolvedValueOnce({
        data: { data: { cart: { id: 10, items: [] } } },
      })
      .mockResolvedValueOnce({ data: { cart: { id: 11, items: [] } } });

    await expect(removeCartItem({ itemId: 21 })).resolves.toEqual({
      id: 10,
      items: [],
    });
    await expect(clearActiveCart({ deviceId: "device-2" })).resolves.toEqual({
      id: 11,
      items: [],
    });

    expect(api.delete).toHaveBeenNthCalledWith(1, "/api/cart/items/21", {
      data: {
        device_id: "device-default",
        mutation_uuid: "mutation-default",
      },
    });
    expect(api.delete).toHaveBeenNthCalledWith(2, "/api/cart/active/items", {
      data: {
        device_id: "device-2",
        mutation_uuid: "mutation-default",
      },
    });
  });

  it("checks out the active cart and returns the unwrapped payload", async () => {
    api.post.mockResolvedValue({ data: { data: { sale_id: 44, total: 99 } } });

    await expect(checkoutCart({ deviceId: "device-3" })).resolves.toEqual({
      sale_id: 44,
      total: 99,
    });
    expect(api.post).toHaveBeenCalledWith("/api/cart/checkout", {
      device_id: "device-3",
      mutation_uuid: "mutation-default",
    });
  });
});
