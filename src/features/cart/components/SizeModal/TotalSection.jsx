import React from 'react'
import PropTypes from 'prop-types'

export const TotalSection = ({ total, formatMoney }) => (
  <div className="total-section">
    <div className="total-label">Total</div>
    <div className="total-input">{formatMoney(total)}</div>
  </div>
)

TotalSection.propTypes = {
  total: PropTypes.number.isRequired,
  formatMoney: PropTypes.func.isRequired,
}
