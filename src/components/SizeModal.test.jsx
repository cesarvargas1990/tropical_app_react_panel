import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import { SizeModal } from "./SizeModal"

const baseProduct = { name: "Jugo", caracteristica: "Especial" }
const baseSize = { id: "s1", nombre: "Grande", basePrice: 2000, delivery: 500 }

const renderModal = (overrideProps = {}) => {
  const props = {
    product: baseProduct,
    sizes: [baseSize],
    sizeState: {},
    onUpdateSize: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrideProps,
  }

  const utils = render(<SizeModal {...props} />)
  return { ...utils, props }
}

describe("SizeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls onUpdateSize when quantity buttons are used", () => {
    const onUpdateSize = vi.fn()
    renderModal({ onUpdateSize })

    fireEvent.click(screen.getByRole("button", { name: "+" }))

    expect(onUpdateSize).toHaveBeenCalledWith(baseSize.id, {
      quantity: 1,
      toppings: 0,
      delivery: false,
      items: [{ toppings: 0, delivery: false }],
    })
  })

  it("enables confirm button when there is a subtotal", () => {
    const sizeState = {
      [baseSize.id]: {
        quantity: 1,
        toppings: 0,
        delivery: false,
        items: [{ toppings: 200, delivery: false }],
      },
    }

    renderModal({ sizeState })

    expect(screen.getByRole("button", { name: /Confirmar/i })).toBeEnabled()
    expect(screen.getByText(/Subtotal:/i)).toBeInTheDocument()
  })

  it("filters sizes when activeSizeId is provided", () => {
    const sizes = [
      { id: "s1", nombre: "Pequeño", basePrice: 1000, delivery: 200 },
      { id: "s2", nombre: "Grande", basePrice: 2000, delivery: 400 },
    ]

    renderModal({ sizes, activeSizeId: "s2" })

    expect(screen.queryByText(/Pequeño/)).toBeNull()
    expect(screen.getByText(/Grande/)).toBeInTheDocument()
  })

  it("updates toppings and delivery through global controls", () => {
    const initialState = {
      [baseSize.id]: {
        quantity: 2,
        toppings: 0,
        delivery: false,
        items: [
          { toppings: 0, delivery: false },
          { toppings: 0, delivery: false },
        ],
      },
    }
    const onUpdateSize = vi.fn()

    renderModal({ sizeState: initialState, onUpdateSize })

    const input = screen.getByPlaceholderText("Ej: 500")
    fireEvent.change(input, { target: { value: "300a" } })

    expect(onUpdateSize).toHaveBeenCalledWith(baseSize.id, expect.objectContaining({
      toppings: 300,
      items: [
        expect.objectContaining({ toppings: 300 }),
        expect.objectContaining({ toppings: 300 }),
      ],
    }))

    const checkbox = screen.getByLabelText(/¿Domicilio\?/i)
    fireEvent.click(checkbox)

    expect(onUpdateSize).toHaveBeenCalledWith(baseSize.id, expect.objectContaining({
      delivery: true,
      items: [
        expect.objectContaining({ delivery: true }),
        expect.objectContaining({ delivery: true }),
      ],
    }))
  })

  it("updates individual row data and keeps delivery flag synced", () => {
    const stateWithRows = {
      [baseSize.id]: {
        quantity: 1,
        toppings: 0,
        delivery: false,
        items: [{ toppings: 100, delivery: false }],
      },
    }
    const onUpdateSize = vi.fn()

    renderModal({ sizeState: stateWithRows, onUpdateSize })

    const rowInput = screen.getByDisplayValue("100")
    fireEvent.change(rowInput, { target: { value: "450" } })

    expect(onUpdateSize).toHaveBeenCalledWith(baseSize.id, expect.objectContaining({
      items: [expect.objectContaining({ toppings: 450 })],
    }))

    const rowDelivery = screen.getAllByRole("checkbox")[1]
    fireEvent.click(rowDelivery)

    expect(onUpdateSize).toHaveBeenCalledWith(baseSize.id, expect.objectContaining({
      delivery: true,
      items: [expect.objectContaining({ delivery: true })],
    }))
  })
})
