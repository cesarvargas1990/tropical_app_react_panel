import React from 'react'
import PropTypes from 'prop-types'
import { SizeCard } from '../SizeCard/index'

export const SizeGrid = ({
  sizes,
  sizeState,
  onQuantityChange,
  onGlobalDeliveryChange,
  onRowPatch,
  renderToppingsDisplay,
  formatMoney,
  getSizeSubtotal,
  getRowSubtotal,
}) => (
  <div className="size-grid">
    {sizes.map((size) => (
      <SizeCard
        key={size.id}
        size={size}
        sizeState={sizeState}
        onQuantityChange={onQuantityChange}
        onGlobalDeliveryChange={onGlobalDeliveryChange}
        onRowPatch={onRowPatch}
        renderToppingsDisplay={renderToppingsDisplay}
        formatMoney={formatMoney}
        getSizeSubtotal={getSizeSubtotal}
        getRowSubtotal={getRowSubtotal}
      />
    ))}
  </div>
)

SizeGrid.propTypes = {
  sizes: PropTypes.array.isRequired,
  sizeState: PropTypes.object.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  onGlobalDeliveryChange: PropTypes.func.isRequired,
  onRowPatch: PropTypes.func.isRequired,
  renderToppingsDisplay: PropTypes.func.isRequired,
  formatMoney: PropTypes.func.isRequired,
  getSizeSubtotal: PropTypes.func.isRequired,
  getRowSubtotal: PropTypes.func.isRequired,
}
