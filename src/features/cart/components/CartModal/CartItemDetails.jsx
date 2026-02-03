import React from 'react'
import { formatMoney } from './utils'

export const CartItemDetails = ({ item }) => (
  <div className="cart-item-details">
    <div>Cantidad: {item.quantity}</div>
    <div>Valor unidad: {formatMoney(item.unitPrice)}</div>
    {item.toppings && <div>Toppings: {formatMoney(item.toppings)}</div>}
    {item.delivery && <div>Domicilio: {formatMoney(item.delivery)}</div>}
    <div className="subtotal-row">Subtotal: {formatMoney(item.subtotal)}</div>
  </div>
)
