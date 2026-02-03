import React from 'react'
import { KeypadButton } from './KeypadButton'

export const KeypadRow = ({ digits, onKeyPress }) => (
  <div className="keypad-row">
    {digits.map((digit) => (
      <KeypadButton key={digit} value={digit} onClick={onKeyPress} />
    ))}
  </div>
)
