import React from 'react'
import PropTypes from 'prop-types'
import { KeypadButton } from './KeypadButton'

export const KeypadRow = ({ digits, onKeyPress }) => (
  <div className="keypad-row">
    {digits.map((digit) => (
      <KeypadButton key={digit} value={digit} onClick={onKeyPress} />
    ))}
  </div>
)

KeypadRow.propTypes = {
  digits: PropTypes.array.isRequired,
  onKeyPress: PropTypes.func.isRequired,
}
