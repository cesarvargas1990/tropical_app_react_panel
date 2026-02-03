import React from 'react'

export const KeypadButton = ({ value, onClick, variant = 'primary' }) => (
  <button
    type="button"
    className={`btn-${variant}`}
    onClick={() => onClick(value)}
  >
    {value}
  </button>
)
