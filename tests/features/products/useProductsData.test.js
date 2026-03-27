import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProductsData } from "../../../src/features/products/hooks/useProductsData";

describe("useProductsData", () => {
  const mockProducts = [
    {
      machineId: 1,
      machineName: "Máquina 1",
      sabor_id: 10,
      carac_id: 20,
      tamano_id: 30,
      sabor: "Cerveza",
      imageUrl: "img.png",
      caracteristica: "Fría",
      valor: "5000",
      delivery: "1000",
    },
    {
      machineId: 1,
      machineName: "Máquina 1",
      sabor_id: 10,
      carac_id: 20,
      tamano_id: 31,
      sabor: "Cerveza",
      imageUrl: "img.png",
      caracteristica: "Fría",
      valor: "7000",
      delivery: null,
    },
  ];

  it("carga productos y construye originalProducts", async () => {
    const getProductsFn = vi.fn().mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProductsData(getProductsFn));

    await act(async () => {
      await result.current.loadProducts();
    });

    expect(result.current.originalProducts).toHaveLength(2);
    expect(getProductsFn).toHaveBeenCalledOnce();
  });

  it("agrupa productos por sabor_id + carac_id", async () => {
    const getProductsFn = vi.fn().mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProductsData(getProductsFn));

    await act(async () => {
      await result.current.loadProducts();
    });

    expect(result.current.products).toHaveLength(1);

    const machine = result.current.products[0];
    expect(machine.machineId).toBe(1);
    expect(machine.precios).toHaveLength(2);
  });

  it("no mezcla productos distintos que salen de la misma máquina", async () => {
    const getProductsFn = vi.fn().mockResolvedValue([
      ...mockProducts,
      {
        machineId: 1,
        machineName: "Máquina 1",
        sabor_id: 99,
        carac_id: 88,
        tamano_id: 32,
        sabor: "Whisky",
        imageUrl: "whisky.png",
        caracteristica: "Reserva",
        valor: "12000",
        delivery: "0",
      },
    ]);

    const { result } = renderHook(() => useProductsData(getProductsFn));

    await act(async () => {
      await result.current.loadProducts();
    });

    expect(result.current.products).toHaveLength(2);
    expect(
      result.current.products.map((product) => product.name).sort(),
    ).toEqual(["Cerveza", "Whisky"]);
  });

  it("prioriza el nombre real del producto sobre sabor cuando ambos existen", async () => {
    const getProductsFn = vi.fn().mockResolvedValue([
      {
        machineId: 1,
        machineName: "Tanque 6",
        sabor_id: 10,
        carac_id: 20,
        tamano_id: 30,
        sabor: "Refrescante",
        name: "Cerveza Poker",
        imageUrl: "img.png",
        caracteristica: "Refrescante",
        valor: "5000",
        delivery: "1000",
      },
    ]);

    const { result } = renderHook(() => useProductsData(getProductsFn));

    await act(async () => {
      await result.current.loadProducts();
    });

    expect(result.current.products[0].name).toBe("Cerveza Poker");
  });

  it("construye correctamente la matrix de precios", async () => {
    const getProductsFn = vi.fn().mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProductsData(getProductsFn));

    await act(async () => {
      await result.current.loadProducts();
    });

    expect(result.current.matrix).toEqual({
      "10-20-30": { valor: 5000, delivery: 1000 },
      "10-20-31": { valor: 7000, delivery: 0 },
    });
  });

  it("permite setear manualmente estados expuestos", () => {
    const getProductsFn = vi.fn();

    const { result } = renderHook(() => useProductsData(getProductsFn));

    act(() => {
      result.current.setProducts([{ id: 1 }]);
      result.current.setOriginalProducts([{ foo: "bar" }]);
      result.current.setMatrix({ test: 123 });
    });

    expect(result.current.products).toEqual([{ id: 1 }]);
    expect(result.current.originalProducts).toEqual([{ foo: "bar" }]);
    expect(result.current.matrix).toEqual({ test: 123 });
  });
});
