import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SizeModal } from "../../../src/features/cart/components/SizeModal"

let totalGeneralValue = 0

vi.mock("../../../src/features/cart/hooks/useSizeCalculations", () => ({
  useSizeCalculations: () => ({
    formatMoney: (value) => `$${value}`,
    getSizeSubtotal: vi.fn(),
    getRowSubtotal: vi.fn(),
    getTotalGeneral: () => totalGeneralValue,
  }),
}))

vi.mock("../../../src/features/cart/hooks/useSizeUpdates", () => ({
  useSizeUpdates: () => ({
    handleQuantityChange: vi.fn(),
    handleGlobalDeliveryChange: vi.fn(),
    handleRowPatch: vi.fn(),
  }),
}))

vi.mock("../../../src/features/cart/hooks/useKeypad", () => ({
  useKeypad: () => ({
    activeField: null,
    showKeypad: false,
    getFieldValue: vi.fn(),
    handleKeypadPress: vi.fn(),
    openKeypad: vi.fn(),
    closeKeypad: vi.fn(),
  }),
}))

vi.mock("../../../src/features/cart/components/Keypad", () => ({
  Keypad: () => <div data-testid="keypad" />,
}))

vi.mock("../../../src/features/cart/components/SizeCard", () => ({
  SizeCard: ({ size }) => <div data-testid={`sizecard-${size.id}`} />,
}))

describe("SizeModal (legacy)", () => {
  beforeEach(() => {
    totalGeneralValue = 0
  })

  const baseProps = {
    product: { name: "Jugo", caracteristica: "Especial" },
    sizes: [{ id: 1, nombre: "S", basePrice: 2000 }],
    sizeState: {},
    onUpdateSize: vi.fn(),
  }

  it("renderiza y permite cancelar", () => {
    const onCancel = vi.fn()
    render(
      <SizeModal
        {...baseProps}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )

    expect(screen.getByText(/Jugo/)).toBeInTheDocument()

    fireEvent.click(screen.getByText("Cancelar"))
    expect(onCancel).toHaveBeenCalledTimes(1)

    const confirmButton = screen.getByText("Confirmar")
    expect(confirmButton).toBeDisabled()
  })

  it("permite confirmar cuando hay total", () => {
    totalGeneralValue = 5000
    const onConfirm = vi.fn()

    render(
      <SizeModal
        {...baseProps}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText("Confirmar"))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
