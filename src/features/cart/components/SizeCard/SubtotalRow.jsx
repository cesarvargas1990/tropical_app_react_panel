import React from 'react'

export const SubtotalRow = ({ subtotal, formatMoney }) => (
  <div
    className="size-row subtotal"
    style={{ fontSize: '22px', marginTop: '10px' }}
  >
    <span>Subtotal:</span>
    <span>{formatMoney(subtotal)}</span>
  </div>
)
