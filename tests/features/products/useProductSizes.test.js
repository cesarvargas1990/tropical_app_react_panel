import { describe, it, expect } from "vitest"
import { renderHook } from "@testing-library/react"
import { useProductSizes } from '../../../src/features/products/hooks/useProductSizes'

describe("useProductSizes", () => {
  const originalProducts = [
    // Match (sabor_id=10, carac_id=20)
    {
      sabor_id: 10,
      carac_id: 20,
      tamano_id: 1,
      tamano: "S",
      valor: "5000",
      delivery: "1000",
    },
    // mismo tamano_id (debe NO duplicar)
    {
      sabor_id: 10,
      carac_id: 20,
      tamano_id: 1,
      tamano: "S",
      valor: "9999",
      delivery: "999",
    },
    // otro tamaño (match)
    {
      sabor_id: 10,
      carac_id: 20,
      tamano_id: 2,
      tamano: "M",
      valor: 7000,
      delivery: null,
    },
    // NO match por sabor
    {
      sabor_id: 11,
      carac_id: 20,
      tamano_id: 3,
      tamano: "L",
      valor: "9000",
      delivery: "0",
    },
    // NO match por carac
    {
      sabor_id: 10,
      carac_id: 21,
      tamano_id: 4,
      tamano: "XL",
      valor: "12000",
      delivery: "2000",
    },
  ]

  it("retorna tamaños únicos por sabor_id + carac_id", () => {
    const { result } = renderHook(() => useProductSizes(originalProducts))

    const product = { sabor_id: 10, carac_id: 20 }
    const sizes = result.current.getSizesFor(product)

    expect(sizes).toHaveLength(2)

    // ids únicos
    const ids = sizes.map((s) => s.id).sort((a, b) => a - b)
    expect(ids).toEqual([1, 2])
  })

  it("mapea correctamente los campos (Number(valor) y delivery default 0)", () => {
    const { result } = renderHook(() => useProductSizes(originalProducts))

    const product = { sabor_id: 10, carac_id: 20 }
    const sizes = result.current.getSizesFor(product)

    // tamaño 1 (S) toma el primero que aparece con tamano_id=1
    const s = sizes.find((x) => x.id === 1)
    expect(s).toEqual({
      id: 1,
      nombre: "S",
      basePrice: 5000,
      delivery: 1000,
      carac_id: 20,
    })

    // tamaño 2 (M) delivery null -> 0
    const m = sizes.find((x) => x.id === 2)
    expect(m).toEqual({
      id: 2,
      nombre: "M",
      basePrice: 7000,
      delivery: 0,
      carac_id: 20,
    })
  })

  it("si no hay matches devuelve array vacío", () => {
    const { result } = renderHook(() => useProductSizes(originalProducts))

    const product = { sabor_id: 999, carac_id: 999 }
    const sizes = result.current.getSizesFor(product)

    expect(sizes).toEqual([])
  })
})
