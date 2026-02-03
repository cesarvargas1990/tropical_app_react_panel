import React from 'react'
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
            key={idx}
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
