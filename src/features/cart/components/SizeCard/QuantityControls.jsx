import React from 'react'

export const QuantityControls = ({ quantity, onDecrease, onIncrease }) => (
  <div className="size-row">
    <span>Cantidad:</span>
    <div className="quantity-controls">
      <button className="btn-icon negative" onClick={onDecrease}>
        -
      </button>
      <div className="quantity-display">{quantity}</div>
      <button className="btn-icon positive" onClick={onIncrease}>
        +
      </button>
    </div>
  </div>
)
