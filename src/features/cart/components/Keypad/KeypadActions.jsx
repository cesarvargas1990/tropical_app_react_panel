import React from 'react'

export const KeypadActions = ({ onClose }) => (
  <div className="keypad-actions">
    <button type="button" className="btn-secondary" onClick={onClose}>
      Aceptar
    </button>
  </div>
)
