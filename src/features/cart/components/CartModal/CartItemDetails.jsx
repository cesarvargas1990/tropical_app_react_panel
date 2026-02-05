import React from 'react'
import PropTypes from 'prop-types'
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

CartItemDetails.propTypes = {
  item: PropTypes.shape({
    quantity: PropTypes.number.isRequired,
    unitPrice: PropTypes.number.isRequired,
    toppings: PropTypes.number,
    delivery: PropTypes.number,
    subtotal: PropTypes.number.isRequired,
  }).isRequired,
}
