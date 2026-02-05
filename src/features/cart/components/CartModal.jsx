import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'

// Constantes de estilos
const ICON_BUTTON_STYLE = {
  width: 44,
  height: 44,
  minWidth: 44,
  minHeight: 44,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const LOADING_OVERLAY_STYLE = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.55)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  pointerEvents: 'all',
}

const LOADING_MESSAGE_STYLE = {
  padding: '14px 18px',
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 12,
  color: '#fff',
  fontWeight: 700,
}

// Utilidad para formatear dinero
const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

// Iconos como componentes
const EditIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

// Componente de overlay de carga
const LoadingOverlay = () => (
  <div style={LOADING_OVERLAY_STYLE}>
    <div style={LOADING_MESSAGE_STYLE}>Registrando venta...</div>
  </div>
)

// Componente para los detalles del item
const CartItemDetails = ({ item }) => (
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

// Componente para un item del carrito
const CartItem = ({ item, index, isRegistering, onEditItem }) => {
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

      <button
        className="cart-item-main"
        type="button"
        onClick={handleEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleEdit()
          }
        }}
        disabled={isRegistering}
        style={{
          cursor: isRegistering ? 'not-allowed' : 'pointer',
          opacity: isRegistering ? 0.7 : 1,
        }}
      >
        <div className="cart-item-title">
          {item.productName} ({item.sizeLabel})
        </div>
        <CartItemDetails item={item} />
      </button>

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
    </button>
  )
}

CartItem.propTypes = {
  item: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    sizeLabel: PropTypes.string.isRequired,
    subtotal: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  isRegistering: PropTypes.bool.isRequired,
  onEditItem: PropTypes.func.isRequired,
}
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
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
        style={{
          position: 'relative',
          opacity: isRegistering ? 0.9 : 1,
        }}
      >
        {isRegistering && <LoadingOverlay />}

        <div className="cart-header">
          <h2>Carrito</h2>
          <button
            className="btn-small"
            onClick={handleClose}
            disabled={isRegistering}
          >
            Cerrar
          </button>
        </div>

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

        <div className="cart-footer">
          <div className="cart-total">
            Total <span>{formatMoney(total)}</span>
          </div>

          <div className="cart-actions">
            <button
              className="btn-secondary"
              onClick={handleClear}
              disabled={isRegistering}
            >
              Vaciar
            </button>

            <button
              className="btn-primary"
              onClick={handleRegister}
              disabled={isCartEmpty || isRegistering}
            >
              {isRegistering ? 'Registrando...' : 'Registrar venta'}
            </button>
          </div>
        </div>
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
