import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useCartFlow } from "../../../src/features/cart/hooks/useCartFlow";

const { swalFireMock } = vi.hoisted(() => ({
  swalFireMock: vi.fn(),
}));

vi.mock("../../../src/features/cart/services/cartService", () => ({
  addCartItems: vi.fn(),
  clearActiveCart: vi.fn(),
  getActiveCart: vi.fn(),
  removeCartItem: vi.fn(),
  scanCartItem: vi.fn(),
}));

vi.mock("../../../src/shared/services/deviceId", () => ({
  getDeviceId: vi.fn(() => "tablet-test"),
}));

vi.mock("sweetalert2", () => ({
  default: {
    fire: swalFireMock,
  },
}));

vi.mock("../../../src/features/cart/utils/cartBuilder", () => ({
  buildCartItems: vi.fn(),
  buildEditSizeState: vi.fn(),
}));

import {
  addCartItems,
  clearActiveCart,
  getActiveCart,
  removeCartItem,
  scanCartItem,
} from "../../../src/features/cart/services/cartService";
import {
  buildCartItems,
  buildEditSizeState,
} from "../../../src/features/cart/utils/cartBuilder";

describe("useCartFlow", () => {
  const mockProduct = {
    id: 33,
    productMatrixId: 33,
    name: "Mango",
    sabor_id: 1,
    carac_id: 1,
    tamano_id: 1,
  };

  const originalProducts = [mockProduct];
  const products = [mockProduct];

  const getSizesFor = vi.fn(() => [{ id: 1 }]);

  beforeEach(() => {
    vi.clearAllMocks();
    swalFireMock.mockReset();
    swalFireMock.mockResolvedValue(undefined);
    window.localStorage.clear();
    vi.stubGlobal("navigator", {
      onLine: true,
    });
    getActiveCart.mockResolvedValue({
      id: 10,
      version: 1,
      status: "active",
      items: [],
    });
    addCartItems.mockResolvedValue({
      id: 10,
      version: 2,
      status: "active",
      items: [],
    });
    clearActiveCart.mockResolvedValue({
      id: 10,
      version: 2,
      status: "active",
      items: [],
    });
    removeCartItem.mockResolvedValue({
      id: 10,
      version: 2,
      status: "active",
      items: [],
    });
  });

  function setup(overrides = {}) {
    return renderHook(() =>
      useCartFlow({
        originalProducts,
        matrix: {},
        getSizesFor,
        products,
        ...overrides,
      }),
    );
  }

  it("selecciona un producto y carga tamaños", () => {
    const { result } = setup();

    act(() => {
      result.current.selectProduct(mockProduct);
    });

    expect(result.current.selectedProduct).toEqual(mockProduct);
    expect(result.current.sizes).toEqual([{ id: 1 }]);
    expect(result.current.sizeState).toEqual({});
  });

  it("actualiza el estado de tamaños", () => {
    const { result } = setup();

    act(() => {
      result.current.updateSize(1, { quantity: 2 });
    });

    expect(result.current.sizeState[1]).toEqual({ quantity: 2 });
  });

  it("agrega items al carrito al confirmar tamaños", async () => {
    const builtItem = {
      productMatrixId: 33,
      productName: "Mango",
      quantity: 2,
      unitPrice: 3000,
      toppings: 0,
      delivery: 0,
      subtotal: 6000,
    };

    buildCartItems.mockReturnValue([builtItem]);
    addCartItems.mockResolvedValue({
      id: 10,
      version: 2,
      status: "active",
      items: [{ id: 51, ...builtItem }],
    });

    const { result } = setup();

    act(() => {
      result.current.setSelectedProduct(mockProduct);
    });

    await act(async () => {
      await result.current.confirmSizes();
    });

    expect(addCartItems).toHaveBeenCalledWith({
      deviceId: "tablet-test",
      items: [builtItem],
      source: "manual",
    });
    expect(result.current.cartItems).toEqual([
      expect.objectContaining({
        id: 51,
        productName: "Mango",
        quantity: 2,
      }),
    ]);
    expect(result.current.selectedProduct).toBe(null);
  });

  it("elimina un item del carrito", async () => {
    const { result } = setup();

    act(() => {
      result.current.setCartItems([
        { id: 7, productName: "Mango", quantity: 2 },
      ]);
    });

    await act(async () => {
      await result.current.removeCartItem(7);
    });

    expect(removeCartItem).toHaveBeenCalledWith({
      deviceId: "tablet-test",
      itemId: 7,
    });
    expect(result.current.cartItems).toEqual([]);
  });

  it("limpia todo el carrito", async () => {
    const { result } = setup();

    act(() => {
      result.current.setCartItems([
        { id: 7, productName: "Mango", quantity: 2 },
      ]);
    });

    await act(async () => {
      await result.current.clearCart();
    });

    expect(clearActiveCart).toHaveBeenCalledWith({
      deviceId: "tablet-test",
    });
    expect(result.current.cartItems).toEqual([]);
  });

  it("inicia edición de un item del carrito", () => {
    buildEditSizeState.mockReturnValue({ 1: { quantity: 2 } });
    const editableItem = {
      id: 7,
      productMatrixId: 33,
      productName: "Mango",
      quantity: 2,
    };

    const { result } = setup();

    let response;
    act(() => {
      response = result.current.startEditItem(editableItem, 0);
    });

    expect(response.ok).toBe(true);
    expect(result.current.selectedProduct).toEqual(mockProduct);
    expect(result.current.editIndex).toBe(0);
    expect(result.current.editSourceItemIds).toEqual([7]);
    expect(result.current.sizeState).toEqual({ 1: { quantity: 2 } });
  });

  it("cancela la edición y limpia el producto seleccionado", () => {
    const { result } = setup();

    act(() => {
      result.current.setSelectedProduct(mockProduct);
      result.current.setEditIndex(1);
      result.current.setEditSourceItemIds([1, 2]);
    });

    act(() => {
      result.current.finishEditCancel();
    });

    expect(result.current.selectedProduct).toBe(null);
    expect(result.current.editIndex).toBe(null);
    expect(result.current.editSourceItemIds).toEqual([]);
  });

  it("calcula correctamente el cartCount", () => {
    const { result } = setup();

    act(() => {
      result.current.setCartItems([{ quantity: 2 }, { quantity: 3 }]);
    });

    expect(result.current.cartCount).toBe(5);
  });

  it("sincroniza el carrito inicial desde backend al montar", async () => {
    getActiveCart.mockResolvedValue({
      id: 10,
      version: 3,
      status: "active",
      items: [
        {
          id: 99,
          productMatrixId: 33,
          productName: "Mango",
          quantity: 1,
          unitPrice: 5000,
          toppings: 0,
          delivery: 0,
          subtotal: 5000,
        },
      ],
    });

    const hook = setup();

    await waitFor(() => {
      expect(getActiveCart).toHaveBeenCalledWith("tablet-test");
      expect(hook.result.current.cartItems).toHaveLength(1);
      expect(hook.result.current.cartVersion).toBe(3);
    });
  });

  it("aplica actualizacion optimista al agregar item directo", async () => {
    let resolveScan;
    scanCartItem.mockReturnValue(
      new Promise((resolve) => {
        resolveScan = resolve;
      }),
    );

    const { result } = setup();
    let promise;

    act(() => {
      promise = result.current.addItemDirect({
        productMatrixId: 33,
        sabor: "Mango",
        caracteristica: "Clasico",
        tamano: "L",
        valor: 5000,
        machineId: 8,
        maquinaConfId: 9,
      });
    });

    expect(result.current.cartCount).toBe(1);
    expect(result.current.groupedItems).toHaveLength(1);
    expect(result.current.groupedItems[0]).toEqual(
      expect.objectContaining({
        productMatrixId: 33,
        quantity: 1,
        unitPrice: 5000,
        sizeLabel: "L",
      }),
    );

    await act(async () => {
      resolveScan({
        id: 10,
        version: 2,
        status: "active",
        items: [
          {
            id: 71,
            productMatrixId: 33,
            productName: "Mango (Clasico)",
            quantity: 1,
            unitPrice: 5000,
            toppings: 0,
            delivery: 0,
            subtotal: 5000,
            sizeLabel: "L",
          },
        ],
      });

      await promise;
    });

    expect(scanCartItem).toHaveBeenCalledWith({
      deviceId: "tablet-test",
      productMatrixId: 33,
    });
    expect(result.current.cartItems[0]).toEqual(
      expect.objectContaining({
        id: 71,
        quantity: 1,
      }),
    );
  });

  it("guarda en borrador local si agregar item directo falla por red", async () => {
    scanCartItem.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = setup();
    await waitFor(() => {
      expect(getActiveCart).toHaveBeenCalledWith("tablet-test");
    });
    let ok;

    await act(async () => {
      ok = await result.current.addItemDirect({
        productMatrixId: 33,
        sabor: "Mango",
        caracteristica: "Clasico",
        tamano: "L",
        valor: 5000,
      });
    });

    expect(ok).toBe(true);
    expect(result.current.cartCount).toBe(1);
    expect(result.current.cartItems[0]).toEqual(
      expect.objectContaining({
        __localOnly: true,
        quantity: 1,
        unitPrice: 5000,
      }),
    );
  });

  it("syncCart devuelve el estado local sin consultar backend cuando no hay internet", async () => {
    navigator.onLine = false;

    const { result } = setup();

    await act(async () => {
      await result.current.addItemDirect({
        productMatrixId: 33,
        sabor: "Mango",
        caracteristica: "Clasico",
        tamano: "L",
        valor: 5000,
      });
    });

    getActiveCart.mockClear();

    let snapshot;
    await act(async () => {
      snapshot = await result.current.syncCart();
    });

    expect(getActiveCart).not.toHaveBeenCalled();
    expect(snapshot.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          __localOnly: true,
          productMatrixId: 33,
        }),
      ]),
    );
  });

  it("guarda acceso directo en borrador local cuando no hay internet", async () => {
    navigator.onLine = false;

    const { result } = setup();
    let ok;

    await act(async () => {
      ok = await result.current.addItemDirect({
        productMatrixId: 33,
        sabor: "Mango",
        caracteristica: "Clasico",
        tamano: "L",
        valor: 5000,
      });
    });

    expect(ok).toBe(true);
    expect(scanCartItem).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.hasLocalOnlyItems).toBe(true);
      expect(result.current.shouldRegisterWithDirectApi).toBe(true);
      expect(result.current.cartItems[0]).toEqual(
        expect.objectContaining({
          __localOnly: true,
          quantity: 1,
          unitPrice: 5000,
        }),
      );
    });
  });

  it("resetCart limpia el estado del modal de tamaños y del carrito", async () => {
    const { result } = setup();

    act(() => {
      result.current.setSelectedProduct(mockProduct);
      result.current.setSizeState({
        __activeSizeId: 1,
        1: { quantity: 2, toppings: 0, delivery: false },
      });
      result.current.setEditIndex(0);
      result.current.setEditSourceItemIds([7]);
      result.current.setCartItems([{ id: 7, quantity: 2 }]);
    });

    await waitFor(() => {
      expect(result.current.selectedProduct).toEqual(mockProduct);
      expect(result.current.cartItems).toHaveLength(1);
    });

    act(() => {
      result.current.resetCart();
    });

    expect(result.current.selectedProduct).toBe(null);
    expect(result.current.sizeState).toEqual({});
    expect(result.current.editIndex).toBe(null);
    expect(result.current.editSourceItemIds).toEqual([]);
    expect(result.current.cartItems).toEqual([]);
  });

  it("permite volver a agregar desde modal manual despues de resetear un carrito con version alta", async () => {
    const builtItem = {
      productMatrixId: 33,
      productName: "Mango",
      quantity: 1,
      unitPrice: 3000,
      toppings: 0,
      delivery: 0,
      subtotal: 3000,
    };

    buildCartItems.mockReturnValue([builtItem]);
    addCartItems.mockResolvedValue({
      id: 22,
      version: 2,
      status: "active",
      items: [{ id: 88, ...builtItem }],
    });

    const { result } = setup();

    act(() => {
      result.current.hydrateCart({
        id: 10,
        version: 7,
        status: "checked_out",
        items: [{ id: 51, ...builtItem }],
      });
    });

    act(() => {
      result.current.resetCart();
      result.current.selectProduct(mockProduct);
    });

    await act(async () => {
      await result.current.confirmSizes();
    });

    expect(addCartItems).toHaveBeenCalledWith({
      deviceId: "tablet-test",
      items: [builtItem],
      source: "manual",
    });
    expect(result.current.cartVersion).toBe(2);
    expect(result.current.cartItems).toEqual([
      expect.objectContaining({
        id: 88,
        quantity: 1,
        subtotal: 3000,
      }),
    ]);
  });
});
