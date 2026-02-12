import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProductActions } from "../../src/shared/hooks/useProductActions";

describe("useProductActions", () => {
  it("encuentra y agrega un producto por productMatrixId", () => {
    const originalProducts = [
      { id: 1, productMatrixId: "123", name: "Producto A" },
      { id: 2, productMatrixId: "456", name: "Producto B" },
    ];

    const mockCart = {
      addItemDirect: vi.fn(),
    };

    const onCartOpen = vi.fn();

    const { result } = renderHook(() =>
      useProductActions({ originalProducts, cart: mockCart, onCartOpen }),
    );

    const success = result.current.addProductFromSocket("123");

    expect(success).toBe(true);
    expect(mockCart.addItemDirect).toHaveBeenCalledWith(originalProducts[0], {
      fromSocket: true,
    });
  });

  it("encuentra y agrega un producto por id", () => {
    const originalProducts = [
      { id: 1, name: "Producto A" },
      { id: 2, name: "Producto B" },
    ];

    const mockCart = {
      addItemDirect: vi.fn(),
    };

    const onCartOpen = vi.fn();

    const { result } = renderHook(() =>
      useProductActions({ originalProducts, cart: mockCart, onCartOpen }),
    );

    const success = result.current.addProductFromSocket("2");

    expect(success).toBe(true);
    expect(mockCart.addItemDirect).toHaveBeenCalledWith(originalProducts[1], {
      fromSocket: true,
    });
  });

  it("encuentra y agrega un producto por producto_id", () => {
    const originalProducts = [
      { id: 1, producto_id: "ABC", name: "Producto A" },
      { id: 2, producto_id: "XYZ", name: "Producto B" },
    ];

    const mockCart = {
      addItemDirect: vi.fn(),
    };

    const onCartOpen = vi.fn();

    const { result } = renderHook(() =>
      useProductActions({ originalProducts, cart: mockCart, onCartOpen }),
    );

    const success = result.current.addProductFromSocket("XYZ");

    expect(success).toBe(true);
    expect(mockCart.addItemDirect).toHaveBeenCalledWith(originalProducts[1], {
      fromSocket: true,
    });
  });

  it("retorna false cuando no encuentra el producto", () => {
    const originalProducts = [
      { id: 1, productMatrixId: "123", name: "Producto A" },
    ];

    const mockCart = {
      addItemDirect: vi.fn(),
    };

    const onCartOpen = vi.fn();

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useProductActions({ originalProducts, cart: mockCart, onCartOpen }),
    );

    const success = result.current.addProductFromSocket("999");

    expect(success).toBe(false);
    expect(mockCart.addItemDirect).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Producto no encontrado para socket id:",
      "999",
    );

    consoleWarnSpy.mockRestore();
  });

  it("handleScannerSubmit agrega producto y abre carrito", () => {
    const originalProducts = [
      { id: 1, productMatrixId: "123", name: "Producto A" },
    ];

    const mockCart = {
      addItemDirect: vi.fn(),
    };

    const onCartOpen = vi.fn();

    const { result } = renderHook(() =>
      useProductActions({ originalProducts, cart: mockCart, onCartOpen }),
    );

    result.current.handleScannerSubmit("123");

    expect(mockCart.addItemDirect).toHaveBeenCalled();
    expect(onCartOpen).toHaveBeenCalled();
  });

  it("handleScannerSubmit no abre carrito si no encuentra producto", () => {
    const originalProducts = [
      { id: 1, productMatrixId: "123", name: "Producto A" },
    ];

    const mockCart = {
      addItemDirect: vi.fn(),
    };

    const onCartOpen = vi.fn();

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useProductActions({ originalProducts, cart: mockCart, onCartOpen }),
    );

    result.current.handleScannerSubmit("999");

    expect(mockCart.addItemDirect).not.toHaveBeenCalled();
    expect(onCartOpen).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
