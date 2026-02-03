import React from 'react'

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
