import React from 'react'
import { SizeCardTitle } from './SizeCardTitle'
import { QuantityControls } from './QuantityControls'
import { ToppingsSection } from './ToppingsSection'
import { DeliveryCheckbox } from './DeliveryCheckbox'
import { IndividualRowsList } from './IndividualRowsList'
import { SubtotalRow } from './SubtotalRow'

/**
 * Componente de tarjeta individual para cada tamaño de producto
 */
export function SizeCard({
  size,
  sizeState,
  onQuantityChange,
  onGlobalDeliveryChange,
  onRowPatch,
  renderToppingsDisplay,
  formatMoney,
  getSizeSubtotal,
  getRowSubtotal,
}) {
  const st = sizeState[size.id] || {
    quantity: 0,
    toppings: 0,
    delivery: false,
    items: [],
  }

  const quantity = st.quantity || 0
  const items = st.items || []
  const cardSubtotal = getSizeSubtotal(size, sizeState)

  const handleDecrease = () => onQuantityChange(size.id, -1)
  const handleIncrease = () => onQuantityChange(size.id, 1)
  const handleDeliveryChange = (e) =>
    onGlobalDeliveryChange(size.id, e.target.checked)

  return (
    <div className="size-card">
      <SizeCardTitle sizeName={size.nombre} />

      <QuantityControls
        quantity={quantity}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
      />

      <ToppingsSection
        sizeId={size.id}
        toppings={st.toppings}
        renderToppingsDisplay={renderToppingsDisplay}
      />

      <DeliveryCheckbox
        checked={st.delivery}
        onChange={handleDeliveryChange}
      />

      <IndividualRowsList
        items={items}
        sizeId={size.id}
        size={size}
        renderToppingsDisplay={renderToppingsDisplay}
        onRowPatch={onRowPatch}
        formatMoney={formatMoney}
        getRowSubtotal={getRowSubtotal}
      />

      <SubtotalRow subtotal={cardSubtotal} formatMoney={formatMoney} />
    </div>
  )
}
