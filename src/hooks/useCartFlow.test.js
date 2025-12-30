import { describe, it, expect, beforeEach, vi } from "vitest"

import { useCartFlow } from "./useCartFlow"
import { renderHook, act } from "@testing-library/react"

vi.mock("../utils/cartBuilder", () => ({
  buildCartItems: vi.fn(),
  buildEditSizeState: vi.fn(),
}))

import { buildCartItems, buildEditSizeState } from "../utils/cartBuilder"

describe("useCartFlow", () => {
  const mockProduct = {
    name: "Mango",
    sabor_id: 1,
    carac_id: 1,
  }

  const mockCartItem = {
    productName: "Mango",
    quantity: 2,
  }

  const getSizesFor = vi.fn(() => [{ id: 1 }])

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setup() {
    return renderHook(() =>
      useCartFlow({
        originalProducts: [],
        matrix: {},
        getSizesFor,
        products: [mockProduct],
      })
    )
  }

  // ================================
  // SELECCIONAR PRODUCTO
  // ================================
  it("selecciona un producto y carga tamaños", () => {
    const { result } = setup()

    act(() => {
      result.current.selectProduct(mockProduct)
    })

    expect(result.current.selectedProduct).toEqual(mockProduct)
    expect(result.current.sizes).toEqual([{ id: 1 }])
    expect(result.current.sizeState).toEqual({})
  })

  // ================================
  // UPDATE SIZE
  // ================================
  it("actualiza el estado de tamaños", () => {
    const { result } = setup()

    act(() => {
      result.current.updateSize(1, { quantity: 2 })
    })

    expect(result.current.sizeState[1]).toEqual({ quantity: 2 })
  })

  // ================================
  // CONFIRMAR SIZES (AGREGAR AL CARRITO)
  // ================================
  it("agrega items al carrito al confirmar tamaños", () => {
    buildCartItems.mockReturnValue([mockCartItem])

    const { result } = setup()

    act(() => {
      result.current.confirmSizes()
    })

    expect(result.current.cartItems).toEqual([mockCartItem])
    expect(result.current.selectedProduct).toBe(null)
  })

  // ================================
  // ELIMINAR ITEM DEL CARRITO
  // ================================
  it("elimina un item del carrito", () => {
    const { result } = setup()

    act(() => {
      result.current.setCartItems([mockCartItem])
    })

    act(() => {
      result.current.removeCartItem(0)
    })

    expect(result.current.cartItems).toEqual([])
  })

  // ================================
  // LIMPIAR CARRITO
  // ================================
  it("limpia todo el carrito", () => {
    const { result } = setup()

    act(() => {
      result.current.setCartItems([mockCartItem])
    })

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.cartItems).toEqual([])
  })

  // ================================
  // EDITAR ITEM EXISTENTE
  // ================================
  it("inicia edición de un item del carrito", () => {
    buildEditSizeState.mockReturnValue({ 1: { quantity: 2 } })

    const { result } = setup()

    let response
    act(() => {
      response = result.current.startEditItem(mockCartItem, 0)
    })

    expect(response.ok).toBe(true)
    expect(result.current.selectedProduct).toEqual(mockProduct)
    expect(result.current.editIndex).toBe(0)
    expect(result.current.editSourceIndices).toEqual([0])
    expect(result.current.sizeState).toEqual({ 1: { quantity: 2 } })
  })

  // ================================
  // CANCELAR EDICIÓN
  // ================================
  it("cancela la edición y limpia el producto seleccionado", () => {
    const { result } = setup()

    act(() => {
      result.current.setSelectedProduct(mockProduct)
      result.current.setEditIndex(1)
      result.current.setEditSourceIndices([1, 2])
    })

    act(() => {
      result.current.finishEditCancel()
    })

    expect(result.current.selectedProduct).toBe(null)
    expect(result.current.editIndex).toBe(null)
    expect(result.current.editSourceIndices).toEqual([])
  })

  // ================================
  // CART COUNT
  // ================================
  it("calcula correctamente el cartCount", () => {
    const { result } = setup()

    act(() => {
      result.current.setCartItems([
        { quantity: 2 },
        { quantity: 3 },
      ])
    })

    expect(result.current.cartCount).toBe(5)
  })
})
