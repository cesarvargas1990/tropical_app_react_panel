import React from 'react'
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
