import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModalState } from "../../src/shared/hooks/useModalState";

describe("useModalState", () => {
  it("inicializa con modales cerrados", () => {
    const { result } = renderHook(() => useModalState());

    expect(result.current.showCart).toBe(false);
    expect(result.current.showRecent).toBe(false);
  });

  it("abre el carrito", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.openCart();
    });

    expect(result.current.showCart).toBe(true);
  });

  it("cierra el carrito", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.openCart();
    });

    expect(result.current.showCart).toBe(true);

    act(() => {
      result.current.closeCart();
    });

    expect(result.current.showCart).toBe(false);
  });

  it("alterna el carrito", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.toggleCart();
    });

    expect(result.current.showCart).toBe(true);

    act(() => {
      result.current.toggleCart();
    });

    expect(result.current.showCart).toBe(false);
  });

  it("abre el modal de ventas recientes", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.openRecent();
    });

    expect(result.current.showRecent).toBe(true);
  });

  it("cierra el modal de ventas recientes", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.openRecent();
    });

    expect(result.current.showRecent).toBe(true);

    act(() => {
      result.current.closeRecent();
    });

    expect(result.current.showRecent).toBe(false);
  });

  it("alterna el modal de ventas recientes", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.toggleRecent();
    });

    expect(result.current.showRecent).toBe(true);

    act(() => {
      result.current.toggleRecent();
    });

    expect(result.current.showRecent).toBe(false);
  });

  it("ambos modales pueden estar abiertos simultáneamente", () => {
    const { result } = renderHook(() => useModalState());

    act(() => {
      result.current.openCart();
      result.current.openRecent();
    });

    expect(result.current.showCart).toBe(true);
    expect(result.current.showRecent).toBe(true);
  });
});
