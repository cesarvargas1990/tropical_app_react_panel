import { useCallback, useState } from 'react'

/**
 * Hook para manejar el teclado numérico (keypad) de toppings
 */
export function useKeypad({ sizeState, onUpdateSize }) {
  const [activeField, setActiveField] = useState(null)
  const [showKeypad, setShowKeypad] = useState(false)

  const getFieldValue = useCallback(
    (field) => {
      if (!field) return '0'
      const current = sizeState[field.sizeId] || {
        quantity: 0,
        toppings: 0,
        delivery: false,
        items: [],
      }
      if (field.type === 'global') return String(current.toppings || 0)
      const row = (current.items || [])[field.index]
      return String(row?.toppings || 0)
    },
    [sizeState]
  )

  const applyValueToField = useCallback(
    (field, valueStr) => {
      if (!field) return
      
      let value = String(valueStr).replace(/[^0-9]/g, '')
      if (value === '' || Number(value) < 0) value = '0'
      const numberValue = Number(value)

      const current = sizeState[field.sizeId] || {
        quantity: 0,
        toppings: 0,
        delivery: false,
        items: [],
      }

      if (field.type === 'global') {
        // Actualizar toppings globales
        const items = (current.items || []).map((row) => ({
          ...row,
          toppings: numberValue,
        }))

        onUpdateSize(field.sizeId, {
          ...current,
          toppings: numberValue,
          items,
        })
      } else {
        // Actualizar topping de fila individual
        let items = [...(current.items || [])]
        items[field.index] = { 
          ...items[field.index], 
          toppings: numberValue 
        }

        const globalDelivery = items.some((r) => r.delivery)

        onUpdateSize(field.sizeId, {
          ...current,
          items,
          delivery: globalDelivery,
        })
      }
    },
    [sizeState, onUpdateSize]
  )

  const handleKeypadPress = useCallback(
    (key) => {
      if (!activeField) return
      const current = getFieldValue(activeField)
      let next = current
      if (key === 'backspace') {
        next = current.length > 1 ? current.slice(0, -1) : '0'
      } else if (key === 'clear') {
        next = '0'
      } else {
        const base = current === '0' ? '' : current
        next = `${base}${key}`
      }
      applyValueToField(activeField, next)
    },
    [activeField, applyValueToField, getFieldValue]
  )

  const openKeypad = (field) => {
    setActiveField(field)
    setShowKeypad(true)
  }

  const closeKeypad = () => {
    setShowKeypad(false)
  }

  return {
    activeField,
    showKeypad,
    getFieldValue,
    handleKeypadPress,
    openKeypad,
    closeKeypad,
  }
}
