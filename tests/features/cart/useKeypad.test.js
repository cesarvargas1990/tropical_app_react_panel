import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeypad } from '../../../src/features/cart/hooks/useKeypad'

describe('useKeypad', () => {
  it('abre el keypad con el campo activo', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {}

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    expect(result.current.showKeypad).toBe(false)

    act(() => {
      result.current.openKeypad({ type: 'global', sizeId: 1 })
    })

    expect(result.current.showKeypad).toBe(true)
    expect(result.current.activeField).toEqual({ type: 'global', sizeId: 1 })
  })

  it('cierra el keypad', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {}

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.openKeypad({ type: 'global', sizeId: 1 })
    })

    expect(result.current.showKeypad).toBe(true)

    act(() => {
      result.current.closeKeypad()
    })

    expect(result.current.showKeypad).toBe(false)
  })

  it('obtiene el valor de un campo global', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: { quantity: 1, toppings: 2500, delivery: false, items: [] },
    }

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    const value = result.current.getFieldValue({
      type: 'global',
      sizeId: 1,
    })

    expect(value).toBe('2500')
  })

  it('obtiene el valor de un campo de fila', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: {
        quantity: 1,
        toppings: 0,
        delivery: false,
        items: [{ toppings: 1500, delivery: false }],
      },
    }

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    const value = result.current.getFieldValue({
      type: 'row',
      sizeId: 1,
      index: 0,
    })

    expect(value).toBe('1500')
  })

  it('retorna "0" cuando no hay valor', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {}

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    const value = result.current.getFieldValue({
      type: 'global',
      sizeId: 1,
    })

    expect(value).toBe('0')
  })

  it('agrega dígitos al valor', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: { quantity: 1, toppings: 0, delivery: false, items: [] },
    }

    const { result, rerender } = renderHook(
      ({ state }) => useKeypad({ sizeState: state, onUpdateSize }),
      { initialProps: { state: sizeState } }
    )

    act(() => {
      result.current.openKeypad({ type: 'global', sizeId: 1 })
    })

    act(() => {
      result.current.handleKeypadPress('5')
    })

    expect(onUpdateSize).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ toppings: 5 })
    )
  })

  it('borra el último dígito con backspace', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: { quantity: 1, toppings: 123, delivery: false, items: [] },
    }

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.openKeypad({ type: 'global', sizeId: 1 })
    })

    act(() => {
      result.current.handleKeypadPress('backspace')
    })

    expect(onUpdateSize).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ toppings: 12 })
    )
  })

  it('limpia el valor con clear', () => {
    const onUpdateSize = vi.fn()
    const sizeState = {
      1: { quantity: 1, toppings: 9999, delivery: false, items: [] },
    }

    const { result } = renderHook(() =>
      useKeypad({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.openKeypad({ type: 'global', sizeId: 1 })
    })

    act(() => {
      result.current.handleKeypadPress('clear')
    })

    expect(onUpdateSize).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ toppings: 0 })
    )
  })

  it('actualiza topping de fila individual', () => {
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
      useKeypad({ sizeState, onUpdateSize })
    )

    act(() => {
      result.current.openKeypad({ type: 'row', sizeId: 1, index: 0 })
    })

    act(() => {
      result.current.handleKeypadPress('7')
    })

    expect(onUpdateSize).toHaveBeenCalledWith(1, {
      quantity: 1,
      toppings: 0,
      delivery: false,
      items: [{ toppings: 7, delivery: false }],
    })
  })
})
