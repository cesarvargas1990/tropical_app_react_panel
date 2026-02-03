import React from 'react'

export const TotalSection = ({ total, formatMoney }) => (
  <div className="total-section">
    <div className="total-label">Total</div>
    <div className="total-input">{formatMoney(total)}</div>
  </div>
)
