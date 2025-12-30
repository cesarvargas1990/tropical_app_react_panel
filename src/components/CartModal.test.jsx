import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'

import { CartModal } from './CartModal'

const buildItem = (overrides = {}) => ({
  productName: 'Jugo Tropical',
  sizeLabel: 'M',
  quantity: 2,
  unitPrice: 1000,
  toppings: 500,
  delivery: 0,
  subtotal: 2500,
  onRemove: vi.fn(),
  ...overrides,
})

describe('CartModal', () => {
  it('shows empty state and disables register button when there are no items', () => {
    const onClose = vi.fn()

    render(
      <CartModal
        items={[]}
        onClose={onClose}
        onClear={vi.fn()}
        onRegister={vi.fn()}
        onEditItem={vi.fn()}
      />
    )

    expect(
      screen.getByText('No hay productos en el carrito.')
    ).toBeInTheDocument()

    const registerButton = screen.getByRole('button', {
      name: /Registrar venta/i,
    })
    expect(registerButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('allows editing and removing items when not registering', () => {
    const onEditItem = vi.fn()
    const firstItem = buildItem()
    const secondItem = buildItem({
      productName: 'Ceviche',
      sizeLabel: 'XL',
      subtotal: 8000,
    })

    const { container } = render(
      <CartModal
        items={[firstItem, secondItem]}
        onClose={vi.fn()}
        onClear={vi.fn()}
        onRegister={vi.fn()}
        onEditItem={onEditItem}
      />
    )

    const cartItems = container.querySelectorAll('.cart-item')
    const [editButton, deleteButton] = within(cartItems[0]).getAllByRole(
      'button',
      { hidden: true }
    )

    fireEvent.click(editButton)
    expect(onEditItem).toHaveBeenCalledWith(firstItem, 0)

    fireEvent.click(deleteButton)
    expect(firstItem.onRemove).toHaveBeenCalledWith(0)

    expect(screen.getByText('Ceviche (XL)')).toBeInTheDocument()
    const subtotalRow = within(cartItems[1]).getByText(/Subtotal:/i)
    expect(subtotalRow).toHaveTextContent(/8\.000/)
  })

  it('awaits onRegister and blocks interactions until it resolves', async () => {
    const onRegister = vi.fn(() => Promise.resolve())
    const onClear = vi.fn()
    const onClose = vi.fn()
    const onEditItem = vi.fn()

    const { container } = render(
      <CartModal
        items={[buildItem({ subtotal: 1000 })]}
        onClose={onClose}
        onClear={onClear}
        onRegister={onRegister}
        onEditItem={onEditItem}
      />
    )

    const registerButton = screen.getByRole('button', {
      name: /Registrar venta/i,
    })
    fireEvent.click(registerButton)

    expect(onRegister).toHaveBeenCalledTimes(1)
    expect(registerButton).toBeDisabled()
    expect(registerButton).toHaveTextContent('Registrando...')

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }))
    expect(onClose).not.toHaveBeenCalled()

    const editButton = container.querySelector('.cart-item .icon-circle')
    fireEvent.click(editButton)
    expect(onEditItem).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(onClear).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    expect(registerButton).not.toBeDisabled()
    expect(registerButton).toHaveTextContent('Registrar venta')
  })
})
