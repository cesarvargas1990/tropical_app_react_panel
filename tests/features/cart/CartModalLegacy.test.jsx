import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartModal } from "../../../src/features/cart/components/CartModal";

describe("CartModal (legacy)", () => {
  const buildItem = () => ({
    productName: "Refrescante",
    sizeLabel: "S",
    subtotal: 6000,
    quantity: 1,
    unitPrice: 6000,
    toppings: 0,
    delivery: 0,
    onRemove: vi.fn(),
  });

  it("renderiza y permite acciones básicas", async () => {
    const onClose = vi.fn();
    const onClear = vi.fn();
    const onRegister = vi.fn(() => Promise.resolve());
    const onEditItem = vi.fn();
    const item = buildItem();

    const { container } = render(
      <CartModal
        items={[item]}
        onClose={onClose}
        onClear={onClear}
        onRegister={onRegister}
        onEditItem={onEditItem}
      />,
    );

    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Vaciar"));
    expect(onClear).toHaveBeenCalledTimes(1);

    const editButton = container.querySelector(".cart-item-main");
    fireEvent.click(editButton);
    expect(onEditItem).toHaveBeenCalledTimes(1);

    const removeButton = container.querySelector(
      ".cart-item-side .icon-circle",
    );
    fireEvent.click(removeButton);
    expect(item.onRemove).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Registrar venta"));
    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledTimes(1);
    });
  });

  it("muestra estado vacío", () => {
    render(
      <CartModal
        items={[]}
        onClose={vi.fn()}
        onClear={vi.fn()}
        onRegister={vi.fn()}
        onEditItem={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No hay productos en el carrito."),
    ).toBeInTheDocument();
  });
});
