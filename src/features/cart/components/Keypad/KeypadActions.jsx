import React from 'react'
import PropTypes from 'prop-types'

export const KeypadActions = ({ onClose }) => (
  <div className="keypad-actions">
    <button type="button" className="btn-secondary" onClick={onClose}>
      Aceptar
    </button>
  </div>
)

KeypadActions.propTypes = {
  onClose: PropTypes.func.isRequired,
}
