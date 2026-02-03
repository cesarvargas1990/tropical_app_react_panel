import React from 'react'
import { formatMoney } from './utils'

export const CartFooter = ({ 
  total, 
  isCartEmpty, 
  isRegistering, 
  onClear, 
  onRegister 
}) => (
  <div className="cart-footer">
    <div className="cart-total">
      Total <span>{formatMoney(total)}</span>
    </div>

    <div className="cart-actions">
      <button
        className="btn-secondary"
        onClick={onClear}
        disabled={isRegistering}
      >
        Vaciar
      </button>

      <button
        className="btn-primary"
        onClick={onRegister}
        disabled={isCartEmpty || isRegistering}
      >
        {isRegistering ? 'Registrando...' : 'Registrar venta'}
      </button>
    </div>
  </div>
)
