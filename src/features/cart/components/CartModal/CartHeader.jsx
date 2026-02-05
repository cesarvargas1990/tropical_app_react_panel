import React from 'react'
import PropTypes from 'prop-types'

export const CartHeader = ({ onClose, isRegistering }) => (
  <div className="cart-header">
    <h2>Carrito</h2>
    <button
      className="btn-small"
      onClick={onClose}
      disabled={isRegistering}
    >
      Cerrar
    </button>
  </div>
)

CartHeader.propTypes = {
  onClose: PropTypes.func.isRequired,
  isRegistering: PropTypes.bool.isRequired,
}
