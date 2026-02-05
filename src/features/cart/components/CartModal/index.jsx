import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { CartHeader } from './CartHeader'
import { CartItemsList } from './CartItemsList'
import { CartFooter } from './CartFooter'
import { LoadingOverlay } from './LoadingOverlay'

export function CartModal({
  items,
  onClose,
  onClear,
  onRegister,
  onEditItem,
}) {
  const [isRegistering, setIsRegistering] = useState(false)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items]
  )

  const handleRegister = async () => {
    if (isRegistering) return
    setIsRegistering(true)

    try {
      await Promise.resolve(onRegister())
      onClear?.()
      onClose?.()
    } catch (e) {
      console.error(e)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleClose = () => {
    if (!isRegistering) {
      onClose?.()
    }
  }

  const handleClear = () => {
    if (!isRegistering) {
      onClear?.()
    }
  }

  const isCartEmpty = items.length === 0

  return (
    <div
      className="modal-backdrop cart-backdrop"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault()
          handleClose()
        }
      }}
      role="presentation"
      style={{ cursor: isRegistering ? 'not-allowed' : 'default' }}
    >
      <div
        className="cart-modal"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
        style={{
          position: 'relative',
          opacity: isRegistering ? 0.9 : 1,
        }}
      >
        {isRegistering && <LoadingOverlay />}

        <CartHeader onClose={handleClose} isRegistering={isRegistering} />

        <CartItemsList
          items={items}
          isRegistering={isRegistering}
          onEditItem={onEditItem}
        />

        <CartFooter
          total={total}
          isCartEmpty={isCartEmpty}
          isRegistering={isRegistering}
          onClear={handleClear}
          onRegister={handleRegister}
        />
      </div>
    </div>
  )
}

CartModal.propTypes = {
  items: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
}
