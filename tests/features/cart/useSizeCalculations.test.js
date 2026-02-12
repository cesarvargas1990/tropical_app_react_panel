import { describe, it, expect } from "vitest";
import { useSizeCalculations } from "../../../src/features/cart/hooks/useSizeCalculations";

describe("useSizeCalculations", () => {
  const { formatMoney, getSizeSubtotal, getRowSubtotal, getTotalGeneral } =
    useSizeCalculations();

  const mockSize = {
    id: 1,
    nombre: "Mediano",
    basePrice: 10000,
    delivery: 3000,
  };

  const mockSizeState = {
    1: {
      quantity: 2,
      toppings: 2000,
      delivery: true,
      items: [
        { toppings: 2000, delivery: true },
        { toppings: 1000, delivery: false },
      ],
    },
  };

  it("formatea correctamente los valores monetarios", () => {
    const formatted = formatMoney(25000);
    expect(formatted).toContain("25.000");
    expect(formatted).toContain("$");
  });

  it("calcula el subtotal de un tamaño", () => {
    const subtotal = getSizeSubtotal(mockSize, mockSizeState);
    // Item 1: 10000 + 2000 + 3000 = 15000
    // Item 2: 10000 + 1000 + 0 = 11000
    // Total: 26000
    expect(subtotal).toBe(26000);
  });

  it("retorna 0 si no hay items en el estado", () => {
    const emptyState = { 1: { quantity: 0, items: [] } };
    const subtotal = getSizeSubtotal(mockSize, emptyState);
    expect(subtotal).toBe(0);
  });

  it("calcula el subtotal de una fila individual", () => {
    const row = { toppings: 2000, delivery: true };
    const rowSubtotal = getRowSubtotal(mockSize, row);
    // 10000 + 2000 + 3000 = 15000
    expect(rowSubtotal).toBe(15000);
  });

  it("calcula el subtotal sin delivery", () => {
    const row = { toppings: 1500, delivery: false };
    const rowSubtotal = getRowSubtotal(mockSize, row);
    // 10000 + 1500 + 0 = 11500
    expect(rowSubtotal).toBe(11500);
  });

  it("calcula el total general de múltiples tamaños", () => {
    const sizes = [mockSize];
    const total = getTotalGeneral(sizes, mockSizeState);
    expect(total).toBe(26000);
  });

  it("maneja múltiples tamaños correctamente", () => {
    const sizes = [
      mockSize,
      { id: 2, nombre: "Grande", basePrice: 15000, delivery: 4000 },
    ];

    const stateWithMultipleSizes = {
      ...mockSizeState,
      2: {
        quantity: 1,
        toppings: 3000,
        delivery: false,
        items: [{ toppings: 3000, delivery: false }],
      },
    };

    const total = getTotalGeneral(sizes, stateWithMultipleSizes);
    // Size 1: 26000
    // Size 2: 15000 + 3000 = 18000
    // Total: 44000
    expect(total).toBe(44000);
  });
});
