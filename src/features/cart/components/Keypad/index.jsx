import React from 'react'
import PropTypes from 'prop-types'
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
    <div className="modal-backdrop keypad-backdrop">
      <button
        type="button"
        className="modal-backdrop-button"
        onClick={onClose}
        aria-label="Cerrar teclado"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'default'
        }}
      />
      <div className="modal keypad-modal" style={{ position: 'relative', zIndex: 1 }}>
        <KeypadHeader />
        <KeypadDisplay value={getFieldValue(activeField)} />
        <KeypadGrid onKeyPress={onKeyPress} />
        <KeypadActions onClose={onClose} />
      </div>
    </div>
  )
}

Keypad.propTypes = {
  activeField: PropTypes.object,
  getFieldValue: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
