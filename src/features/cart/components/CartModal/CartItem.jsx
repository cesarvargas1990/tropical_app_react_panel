import React from 'react'
import { CartItemDetails } from './CartItemDetails'
import { formatMoney } from './utils'
import { EditIcon, TrashIcon } from './Icons'
import { ICON_BUTTON_STYLE } from './constants'

export const CartItem = ({ item, index, isRegistering, onEditItem }) => {
  const handleEdit = () => {
    if (!isRegistering) {
      onEditItem(item, index)
    }
  }

  const handleRemove = () => {
    if (!isRegistering) {
      item.onRemove(index)
    }
  }

  const iconButtonStyle = {
    ...ICON_BUTTON_STYLE,
    cursor: isRegistering ? 'not-allowed' : 'pointer',
    opacity: isRegistering ? 0.6 : 1,
  }

  return (
    <div className="cart-item">
      <button
        onClick={handleEdit}
        className="icon-circle"
        disabled={isRegistering}
        style={{
          ...iconButtonStyle,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.20)',
        }}
      >
        <EditIcon />
      </button>

      <div
        className="cart-item-main"
        onClick={handleEdit}
        style={{
          cursor: isRegistering ? 'not-allowed' : 'pointer',
          opacity: isRegistering ? 0.7 : 1,
        }}
      >
        <div className="cart-item-title">
          {item.productName} ({item.sizeLabel})
        </div>
        <CartItemDetails item={item} />
      </div>

      <div className="cart-item-side">
        <div className="cart-item-subtotal-big">
          {formatMoney(item.subtotal)}
        </div>
        <button
          onClick={handleRemove}
          className="icon-circle"
          disabled={isRegistering}
          style={{
            ...iconButtonStyle,
            background: '#C62828',
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
