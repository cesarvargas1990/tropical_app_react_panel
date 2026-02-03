import React from 'react'

export const ToppingsSection = ({ sizeId, toppings, renderToppingsDisplay }) => (
  <>
    <div className="size-row">
      <span>Valor toppings:</span>
    </div>
    <div className="size-row">
      {renderToppingsDisplay(
        { type: 'global', sizeId },
        String(toppings || 0)
      )}
    </div>
  </>
)
