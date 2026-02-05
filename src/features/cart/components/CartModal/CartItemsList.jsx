import React from 'react'
import PropTypes from 'prop-types'
import { CartItem } from './CartItem'

export const CartItemsList = ({ items, isRegistering, onEditItem }) => {
  const isCartEmpty = items.length === 0

  return (
    <div className="cart-items">
      {isCartEmpty ? (
        <div className="cart-empty">No hay productos en el carrito.</div>
      ) : (
        items.map((item, idx) => (
          <CartItem
            key={`${item.productName}-${item.sizeLabel}-${idx}`}
            item={item}
            index={idx}
            isRegistering={isRegistering}
            onEditItem={onEditItem}
          />
        ))
      )}
    </div>
  )
}

CartItemsList.propTypes = {
  items: PropTypes.array.isRequired,
  isRegistering: PropTypes.bool.isRequired,
  onEditItem: PropTypes.func.isRequired,
}
