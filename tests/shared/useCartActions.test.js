import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCartActions } from "../../src/shared/hooks/useCartActions";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe("useCartActions", () => {
  it("handleRegisterSale registra la venta y limpia carrito", async () => {
    const mockCart = {
      groupedItems: [{ id: 1, name: "Item 1" }],
      clearCart: vi.fn(),
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn().mockResolvedValue(true);
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    await result.current.handleRegisterSale();

    expect(mockRegister).toHaveBeenCalledWith(mockCart.groupedItems);
    expect(mockCart.clearCart).toHaveBeenCalled();
    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("handleRegisterSale muestra error si falla", async () => {
    const mockCart = {
      groupedItems: [{ id: 1, name: "Item 1" }],
      clearCart: vi.fn(),
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn().mockRejectedValue(new Error("Error de red"));
    const mockCloseCart = vi.fn();

    const Swal = (await import("sweetalert2")).default;

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    await result.current.handleRegisterSale();

    expect(mockRegister).toHaveBeenCalledWith(mockCart.groupedItems);
    expect(mockCart.clearCart).not.toHaveBeenCalled();
    expect(mockCloseCart).not.toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith({
      title: "Error",
      text: "Error de red",
      icon: "error",
    });
  });

  it("handleEditItem inicia edición y cierra carrito", () => {
    const mockCart = {
      startEditItem: vi.fn().mockReturnValue({ ok: true }),
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn();
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    const item = { id: 1, name: "Item 1" };
    result.current.handleEditItem(item, 0);

    expect(mockCart.startEditItem).toHaveBeenCalledWith(item, 0);
    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("handleEditItem no cierra carrito si falla", () => {
    const mockCart = {
      startEditItem: vi.fn().mockReturnValue({ ok: false }),
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn();
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    const item = { id: 1, name: "Item 1" };
    result.current.handleEditItem(item, 0);

    expect(mockCart.startEditItem).toHaveBeenCalledWith(item, 0);
    expect(mockCloseCart).not.toHaveBeenCalled();
  });

  it("handleEditItem usa sourceIndex si no hay index", () => {
    const mockCart = {
      startEditItem: vi.fn().mockReturnValue({ ok: true }),
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn();
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    const item = { id: 1, name: "Item 1", sourceIndex: 2 };
    result.current.handleEditItem(item);

    expect(mockCart.startEditItem).toHaveBeenCalledWith(item, 2);
  });

  it("handleEditItem usa sourceIndices[0] si está disponible", () => {
    const mockCart = {
      startEditItem: vi.fn().mockReturnValue({ ok: true }),
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn();
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    const item = { id: 1, name: "Item 1", sourceIndices: [3, 4] };
    result.current.handleEditItem(item);

    expect(mockCart.startEditItem).toHaveBeenCalledWith(item, 3);
  });

  it("cartButtonDisabled es true cuando no hay items", () => {
    const mockCart = {
      cartItems: [],
    };

    const mockRegister = vi.fn();
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    expect(result.current.cartButtonDisabled).toBe(true);
  });

  it("cartButtonDisabled es false cuando hay items", () => {
    const mockCart = {
      cartItems: [{ id: 1 }],
    };

    const mockRegister = vi.fn();
    const mockCloseCart = vi.fn();

    const { result } = renderHook(() =>
      useCartActions({
        cart: mockCart,
        register: mockRegister,
        closeCart: mockCloseCart,
      }),
    );

    expect(result.current.cartButtonDisabled).toBe(false);
  });
});
