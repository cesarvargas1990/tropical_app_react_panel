import React from 'react'
import PropTypes from 'prop-types'

export const KeypadButton = ({ value, onClick, variant = 'primary' }) => (
  <button
    type="button"
    className={`btn-${variant}`}
    onClick={() => onClick(value)}
  >
    {value}
  </button>
)

KeypadButton.propTypes = {
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
}
