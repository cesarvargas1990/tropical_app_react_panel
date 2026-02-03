import React, { useState } from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"

import { SizeModal } from '../../../src/features/cart/components/SizeModal/index';

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

const renderModalWithState = (initialState, overrideProps = {}) => {
  const onUpdateSize = vi.fn()
  const props = {
    product: baseProduct,
    sizes: [baseSize],
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrideProps,
  }

  const Wrapper = () => {
    const [state, setState] = useState(initialState)
    return (
      <SizeModal
        {...props}
        sizeState={state}
        onUpdateSize={(sizeId, next) => {
          onUpdateSize(sizeId, next)
          setState((prev) => ({ ...prev, [sizeId]: next }))
        }}
      />
    )
  }

  render(<Wrapper />)
  return { onUpdateSize }
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

    const { onUpdateSize: updateSpy } = renderModalWithState(initialState, { onUpdateSize })

    const display = screen.getByTestId(`toppings-global-${baseSize.id}`)
    fireEvent.click(display)
    const keypad = screen.getByText(/Ingrese valor topping/i).closest(".keypad-modal")
    const keypadScope = within(keypad)
    fireEvent.click(keypadScope.getByRole("button", { name: "3" }))
    fireEvent.click(keypadScope.getByRole("button", { name: "0" }))
    fireEvent.click(keypadScope.getByRole("button", { name: "0" }))

    expect(updateSpy).toHaveBeenLastCalledWith(baseSize.id, expect.objectContaining({
      toppings: 300,
      items: [
        expect.objectContaining({ toppings: 300 }),
        expect.objectContaining({ toppings: 300 }),
      ],
    }))

    const checkbox = screen.getByLabelText(/¿Domicilio\?/i)
    fireEvent.click(checkbox)

    expect(updateSpy).toHaveBeenCalledWith(baseSize.id, expect.objectContaining({
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

    const { onUpdateSize: updateSpy } = renderModalWithState(stateWithRows, { onUpdateSize })

    const rowDisplay = screen.getByTestId(`toppings-row-${baseSize.id}-0`)
    fireEvent.click(rowDisplay)
    const rowKeypad = screen.getByText(/Ingrese valor topping/i).closest(".keypad-modal")
    const rowKeypadScope = within(rowKeypad)
    fireEvent.click(rowKeypadScope.getByRole("button", { name: /Limpiar/i }))
    fireEvent.click(rowKeypadScope.getByRole("button", { name: "4" }))
    fireEvent.click(rowKeypadScope.getByRole("button", { name: "5" }))
    fireEvent.click(rowKeypadScope.getByRole("button", { name: "0" }))

    expect(updateSpy).toHaveBeenLastCalledWith(baseSize.id, expect.objectContaining({
      items: [expect.objectContaining({ toppings: 450 })],
    }))

    const rowDelivery = screen.getAllByRole("checkbox")[1]
    fireEvent.click(rowDelivery)

    expect(updateSpy).toHaveBeenCalledWith(baseSize.id, expect.objectContaining({
      delivery: true,
      items: [expect.objectContaining({ delivery: true })],
    }))
  })
})
