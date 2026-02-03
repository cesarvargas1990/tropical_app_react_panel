import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import MainApp from "../../src/shared/components/MainApp"
import { useProductsData } from '../../src/features/products/hooks/useProductsData'
import { useProductsRealtime } from '../../src/features/products/hooks/useProductsRealtime'
import { useProductSizes } from '../../src/features/products/hooks/useProductSizes'
import { useCartFlow } from '../../src/features/cart/hooks/useCartFlow'
import { useSaleRegister } from '../../src/features/sales/hooks/useSaleRegister'

const { swalFireMock } = vi.hoisted(() => ({
  swalFireMock: vi.fn(),
}))

vi.mock('../../src/features/products/hooks/useProductsData', () => ({
  useProductsData: vi.fn(),
}))

vi.mock('../../src/features/products/hooks/useProductsRealtime', () => ({
  useProductsRealtime: vi.fn(),
}))

vi.mock('../../src/features/products/hooks/useProductSizes', () => ({
  useProductSizes: vi.fn(),
}))

vi.mock('../../src/features/cart/hooks/useCartFlow', () => ({
  useCartFlow: vi.fn(),
}))

vi.mock('../../src/shared/hooks/useBodyLock', () => ({
  useBodyLock: vi.fn(),
}))

vi.mock('../../src/features/sales/hooks/useSaleRegister', () => ({
  useSaleRegister: vi.fn(),
}))

vi.mock('../../src/features/products/components/ProductCard', () => ({
  ProductCard: ({ product, onSelect }) => (
    <button data-testid={`product-${product.id}`} onClick={() => onSelect(product)}>
      {product.name}
    </button>
  ),
}))

vi.mock('../../src/features/cart/components/SizeModal', () => ({
  SizeModal: ({ onConfirm, onCancel }) => (
    <div data-testid="size-modal">
      <button onClick={onConfirm}>confirm-size</button>
      <button onClick={onCancel}>cancel-size</button>
    </div>
  ),
}))

vi.mock('../../src/features/cart/components/CartModal', () => ({
  CartModal: ({ items, onRegister }) => (
    <div data-testid="cart-modal">
      <div>items: {items.length}</div>
      <button onClick={onRegister}>trigger-register</button>
    </div>
  ),
}))

vi.mock('../../src/features/sales/components/RecentSalesModal', () => ({
  RecentSalesModal: ({ onClose }) => (
    <div data-testid="recent-sales">
      <button onClick={onClose}>close-recent</button>
    </div>
  ),
}))

vi.mock("sweetalert2", () => ({
  default: {
    fire: swalFireMock,
  },
}))

const baseProducts = [
  { id: 1, name: "Maracuya", caracteristica: "clasico" },
  { id: 2, name: "Lulo", caracteristica: "fresco" },
]

const createCartState = (overrides = {}) => ({
  selectedProduct: null,
  sizes: [],
  sizeState: { __activeSizeId: null },
  cartItems: [],
  groupedItems: [],
  editIndex: null,
  cartCount: 0,
  selectProduct: vi.fn(),
  updateSize: vi.fn(),
  confirmSizes: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
  startEditItem: vi.fn(() => ({ ok: true })),
  finishEditCancel: vi.fn(),
  ...overrides,
})

describe("MainApp", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    swalFireMock.mockReset()

    useProductSizes.mockReturnValue({ getSizesFor: vi.fn() })
  })

  it("loads products, wires realtime updates, and disables cart button when empty", () => {
    const loadProducts = vi.fn()
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    })
    useProductsRealtime.mockImplementation(() => {})
    useCartFlow.mockReturnValue(createCartState())
    useSaleRegister.mockReturnValue({ register: vi.fn() })

    render(<MainApp />)

    expect(loadProducts).toHaveBeenCalledTimes(1)
    expect(useProductsRealtime).toHaveBeenCalledWith(
      expect.objectContaining({
        onReload: loadProducts,
        onAddProduct: expect.any(Function),
        onOpenCart: expect.any(Function),
      })
    )

    expect(screen.getByTestId("product-1")).toBeInTheDocument()
    expect(screen.getByTestId("product-2")).toBeInTheDocument()

    const continueButton = screen.getByRole("button", { name: /Continuar pedido/i })
    expect(continueButton).toBeDisabled()
  })

  it("registers a sale, clears the cart and hides the modal on success", async () => {
    const loadProducts = vi.fn()
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    })
    useProductsRealtime.mockImplementation(() => {})

    const clearCart = vi.fn()
    const cartState = createCartState({
      cartItems: [{ id: 99 }],
      groupedItems: [{ id: 99 }],
      cartCount: 2,
      clearCart,
    })
    useCartFlow.mockReturnValue(cartState)

    const register = vi.fn().mockResolvedValue(undefined)
    useSaleRegister.mockReturnValue({ register })

    render(<MainApp />)

    fireEvent.click(screen.getByRole("button", { name: /Continuar pedido/i }))
    expect(screen.getByTestId("cart-modal")).toBeInTheDocument()

    fireEvent.click(screen.getByText("trigger-register"))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(cartState.groupedItems)
    })

    expect(clearCart).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.queryByTestId("cart-modal")).toBeNull()
    })
  })

  it("shows an alert and keeps the modal open if register fails", async () => {
    const loadProducts = vi.fn()
    useProductsData.mockReturnValue({
      products: baseProducts,
      originalProducts: baseProducts,
      matrix: {},
      loadProducts,
    })
    useProductsRealtime.mockImplementation(() => {})

    const clearCart = vi.fn()
    const cartState = createCartState({
      cartItems: [{ id: 1 }],
      groupedItems: [{ id: 1 }],
      cartCount: 1,
      clearCart,
    })
    useCartFlow.mockReturnValue(cartState)

    const registerError = vi.fn().mockRejectedValue(new Error("boom"))
    useSaleRegister.mockReturnValue({ register: registerError })

    render(<MainApp />)

    fireEvent.click(screen.getByRole("button", { name: /Continuar pedido/i }))
    fireEvent.click(screen.getByText("trigger-register"))

    await waitFor(() => {
      expect(registerError).toHaveBeenCalledWith(cartState.cartItems)
      expect(swalFireMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          icon: "error",
        })
      )
    })

    expect(clearCart).not.toHaveBeenCalled()
    expect(screen.getByTestId("cart-modal")).toBeInTheDocument()
  })
})
