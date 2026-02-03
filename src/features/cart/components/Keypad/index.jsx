import React from 'react'
import { KeypadHeader } from './KeypadHeader'
import { KeypadDisplay } from './KeypadDisplay'
import { KeypadGrid } from './KeypadGrid'
import { KeypadActions } from './KeypadActions'

/**
 * Componente del teclado numérico para ingresar valores de toppings
 */
export function Keypad({ activeField, getFieldValue, onKeyPress, onClose }) {
  if (!activeField) return null

  return (
    <div className="modal-backdrop keypad-backdrop" onClick={onClose}>
      <div className="modal keypad-modal" onClick={(e) => e.stopPropagation()}>
        <KeypadHeader />
        <KeypadDisplay value={getFieldValue(activeField)} />
        <KeypadGrid onKeyPress={onKeyPress} />
        <KeypadActions onClose={onClose} />
      </div>
    </div>
  )
}
