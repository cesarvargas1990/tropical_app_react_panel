import React, { useState } from 'react'

export function CartModal({
  items,
  onClose,
  onClear,
  onRegister,
  onEditItem,
}) {
  const [isRegistering, setIsRegistering] = useState(false)

  const formatMoney = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value)

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)

  const handleRegister = async () => {
    if (isRegistering) return
    setIsRegistering(true)

    try {
      // Espera a que termine el registro (incluye el "Venta registrada" si onRegister lo muestra)
      await Promise.resolve(onRegister())

      // OPCIONAL: vaciar carrito al terminar el registro
      // (si ya lo vacías en el padre, puedes borrar estas 2 líneas)
      onClear?.()

      // Cierra la modal del carrito
      onClose?.()
    } catch (e) {
      console.error(e)
      // Si falla, se desbloquea para que pueda intentar de nuevo
    } finally {
      setIsRegistering(false)
    }
  }

  const handleClose = () => {
    if (isRegistering) return
    onClose?.()
  }

  return (
    <div
      className="modal-backdrop cart-backdrop"
      onClick={handleClose}
      style={{ cursor: isRegistering ? 'not-allowed' : 'default' }}
    >
      <div
        className="cart-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          opacity: isRegistering ? 0.9 : 1,
        }}
      >
        {/* OVERLAY BLOQUEO */}
        {isRegistering && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              pointerEvents: 'all',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 700,
              }}
            >
              Registrando venta...
            </div>
          </div>
        )}

        {/* HEADER */}
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

        {/* ITEMS */}
        <div className="cart-items">
          {items.length === 0 && (
            <div className="cart-empty">No hay productos en el carrito.</div>
          )}

          {items.map((item, idx) => (
            <div key={idx} className="cart-item">
              {/* EDIT ICON AL INICIO */}
              <button
                onClick={() => {
                  if (isRegistering) return
                  onEditItem(item, idx)
                }}
                className="icon-circle"
                disabled={isRegistering}
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  cursor: isRegistering ? 'not-allowed' : 'pointer',
                  opacity: isRegistering ? 0.6 : 1,
                }}
              >
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
              </button>

              <div
                className="cart-item-main"
                onClick={() => {
                  if (isRegistering) return
                  onEditItem(item, idx)
                }}
                style={{
                  cursor: isRegistering ? 'not-allowed' : 'pointer',
                  opacity: isRegistering ? 0.7 : 1,
                }}
              >
                <div className="cart-item-title">
                  {item.productName} ({item.sizeLabel})
                </div>

                <div className="cart-item-details">
                  <div>Cantidad: {item.quantity}</div>
                  <div>Valor unidad: {formatMoney(item.unitPrice)}</div>

                  {item.toppings ? (
                    <div>Toppings: {formatMoney(item.toppings)}</div>
                  ) : null}

                  {item.delivery ? (
                    <div>Domicilio: {formatMoney(item.delivery)}</div>
                  ) : null}

                  <div className="subtotal-row">
                    Subtotal: {formatMoney(item.subtotal)}
                  </div>
                </div>
              </div>

              {/* SUBTOTAL A LA DERECHA */}
              <div className="cart-item-side">
                <div className="cart-item-subtotal-big">
                  {formatMoney(item.subtotal)}
                </div>

                {/* DELETE ICON */}
                <button
                  onClick={() => {
                    if (isRegistering) return
                    item.onRemove(idx)
                  }}
                  className="icon-circle"
                  disabled={isRegistering}
                  style={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: '50%',
                    background: '#C62828',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: isRegistering ? 'not-allowed' : 'pointer',
                    opacity: isRegistering ? 0.6 : 1,
                  }}
                >
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
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="cart-footer">
          <div className="cart-total">
            Total <span>{formatMoney(total)}</span>
          </div>

          <div className="cart-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                if (isRegistering) return
                onClear?.()
              }}
              disabled={isRegistering}
            >
              Vaciar
            </button>

            <button
              className="btn-primary"
              onClick={handleRegister}
              disabled={items.length === 0 || isRegistering}
            >
              {isRegistering ? 'Registrando...' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
