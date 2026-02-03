import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSizeUpdates } from '../../../src/features/cart/hooks/useSizeUpdates'

describe('useSizeUpdates', () => {
  it('incrementa la cantidad y crea items nuevos', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: { quantity: 0, toppings: 0, delivery: false, items: [] },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleQuantityChange(1, 1)
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 1,
      toppings: 0,
      delivery: false,
      items: [{ toppings: 0, delivery: false }],
    })
  })

  it('decrementa la cantidad y elimina items', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: {
        quantity: 2,
        toppings: 1000,
        delivery: false,
        items: [
          { toppings: 1000, delivery: false },
          { toppings: 1000, delivery: false },
        ],
      },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleQuantityChange(1, -1)
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 1,
      toppings: 1000,
      delivery: false,
      items: [{ toppings: 1000, delivery: false }],
    })
  })

  it('no permite cantidades negativas', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: { quantity: 0, toppings: 0, delivery: false, items: [] },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleQuantityChange(1, -1)
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 0,
      toppings: 0,
      delivery: false,
      items: [],
    })
  })

  it('actualiza el delivery global en todos los items', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: {
        quantity: 2,
        toppings: 0,
        delivery: false,
        items: [
          { toppings: 0, delivery: false },
          { toppings: 0, delivery: false },
        ],
      },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleGlobalDeliveryChange(1, true)
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 2,
      toppings: 0,
      delivery: true,
      items: [
        { toppings: 0, delivery: true },
        { toppings: 0, delivery: true },
      ],
    })
  })

  it('actualiza topping en una fila específica', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: {
        quantity: 2,
        toppings: 0,
        delivery: false,
        items: [
          { toppings: 0, delivery: false },
          { toppings: 0, delivery: false },
        ],
      },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleRowPatch(1, 0, { toppings: 2500 })
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 2,
      toppings: 0,
      delivery: false,
      items: [
        { toppings: 2500, delivery: false },
        { toppings: 0, delivery: false },
      ],
    })
  })

  it('actualiza delivery de una fila y sincroniza el global', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: {
        quantity: 2,
        toppings: 0,
        delivery: false,
        items: [
          { toppings: 0, delivery: false },
          { toppings: 0, delivery: false },
        ],
      },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleRowPatch(1, 0, { delivery: true })
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 2,
      toppings: 0,
      delivery: true, // Se sincroniza a true porque hay una fila con delivery
      items: [
        { toppings: 0, delivery: true },
        { toppings: 0, delivery: false },
      ],
    })
  })

  it('sanitiza valores de toppings en handleRowPatch', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: {
        quantity: 1,
        toppings: 0,
        delivery: false,
        items: [{ toppings: 0, delivery: false }],
      },
    }

    const { result } = renderHook(() =>
      useSizeUpdates({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.handleRowPatch(1, 0, { toppings: 'abc123xyz' })
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 1,
      toppings: 0,
      delivery: false,
      items: [{ toppings: 123, delivery: false }],
    })
  })
})
