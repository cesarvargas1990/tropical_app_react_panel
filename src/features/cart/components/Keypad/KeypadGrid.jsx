import React from 'react'
import PropTypes from 'prop-types'
import { KeypadRow } from './KeypadRow'
import { KeypadBottomRow } from './KeypadBottomRow'
import { KEYPAD_DIGITS } from './constants'

export const KeypadGrid = ({ onKeyPress }) => (
  <div className="keypad-grid">
    {KEYPAD_DIGITS.map((digits, index) => (
      <KeypadRow key={index} digits={digits} onKeyPress={onKeyPress} />
    ))}
    <KeypadBottomRow onKeyPress={onKeyPress} />
  </div>
)

KeypadGrid.propTypes = {
  onKeyPress: PropTypes.func.isRequired,
}
