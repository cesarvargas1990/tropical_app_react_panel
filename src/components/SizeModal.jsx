import React from 'react'

export function SizeModal({
  product,
  sizes,        // ← ahora viene del backend
  sizeState,
  onUpdateSize,
  onConfirm,
  onCancel,
  activeSizeId = null,
}) {
  const formatMoney = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value)

  const getSizeSubtotal = (size) => {
    const st = sizeState[size.id]
    if (!st || !st.items || !st.items.length) return 0

    return st.items.reduce((sum, row) => {
      const t = Number(row.toppings || 0)
      const d = row.delivery ? Number(size.delivery || 0) : 0
      return sum + size.basePrice + t + d
    }, 0)
  }


  const visibleSizes = activeSizeId
    ? sizes.filter((s) => s.id === activeSizeId)
    : sizes

  const totalGeneral = visibleSizes.reduce(
    (sum, s) => sum + getSizeSubtotal(s),
    0
  )

  const handleQuantityChange = (sizeId, delta) => {
    const current =
      sizeState[sizeId] || {
        quantity: 0,
        toppings: 0,
        delivery: false,
        items: [],
      }

    const oldQty = current.quantity || 0
    const newQty = Math.max(0, oldQty + delta)

    let items = Array.isArray(current.items) ? [...current.items] : []

    if (items.length < newQty) {
      for (let i = items.length; i < newQty; i++) {
        items.push({
          toppings: current.toppings || 0,
          delivery: !!current.delivery,
        })
      }
    } else if (items.length > newQty) {
      items = items.slice(0, newQty)
    }

    const globalDelivery = items.some((r) => r.delivery)

    onUpdateSize(sizeId, {
      ...current,
      quantity: newQty,
      items,
      delivery: globalDelivery,
    })
  }

  const handleGlobalToppingsChange = (sizeId, valueRaw) => {
    let value = String(valueRaw).replace(/[^0-9]/g, '')
    if (value === '' || Number(value) < 0) value = '0'

    const numberValue = Number(value)

    const current =
      sizeState[sizeId] || {
        quantity: 0,
        toppings: 0,
        delivery: false,
        items: [],
      }

    const items = (current.items || []).map((row) => ({
      ...row,
      toppings: numberValue,
    }))

    onUpdateSize(sizeId, {
      ...current,
      toppings: numberValue,
      items,
    })
  }

  const handleGlobalDeliveryChange = (sizeId, checked) => {
    const current =
      sizeState[sizeId] || {
        quantity: 0,
        toppings: 0,
        delivery: false,
        items: [],
      }

    const items = (current.items || []).map((row) => ({
      ...row,
      delivery: checked,
    }))

    onUpdateSize(sizeId, {
      ...current,
      delivery: checked,
      items,
    })
  }

  const handleRowPatch = (sizeId, index, patch) => {
    const current =
      sizeState[sizeId] || {
        quantity: 0,
        toppings: 0,
        delivery: false,
        items: [],
      }

    let items = [...(current.items || [])]

    if (patch.toppings !== undefined) {
      let clean = String(patch.toppings).replace(/[^0-9]/g, '')
      if (clean === '' || Number(clean) < 0) clean = '0'
      patch.toppings = Number(clean)
    }

    items[index] = { ...items[index], ...patch }

    const globalDelivery = items.some((r) => r.delivery)

    onUpdateSize(sizeId, {
      ...current,
      items,
      delivery: globalDelivery,
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">{product.name} {product.caracteristica}</h2>

        <div className="size-grid">
          {visibleSizes.map((size) => {
            const st =
              sizeState[size.id] || {
                quantity: 0,
                toppings: 0,
                delivery: false,
                items: [],
              }

            const quantity = st.quantity || 0
            const items = st.items || []
            const cardSubtotal = getSizeSubtotal(size)

            return (
              <div key={size.id} className="size-card">
                <div className="size-title">Tamaño: {size.nombre}</div>

                <div className="size-row">
                  <span>Cantidad:</span>
                  <div className="quantity-controls">
                    <button className="btn-icon negative" onClick={() => handleQuantityChange(size.id, -1)}>
                      -
                    </button>
                    <div className="quantity-display">{quantity}</div>
                    <button className="btn-icon positive" onClick={() => handleQuantityChange(size.id, 1)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="size-row">
                  <span>Valor toppings:</span>
                </div>

                <div className="size-row">
                  <input
                    type="text"
                    placeholder="Ej: 500"
                    className="input"
                    value={st.toppings}
                    onChange={(e) => handleGlobalToppingsChange(size.id, e.target.value)}
                  />
                </div>

                <div className="size-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={st.delivery}
                      onChange={(e) => handleGlobalDeliveryChange(size.id, e.target.checked)}
                    />{" "}
                    ¿Domicilio?
                  </label>
                </div>

                {/* Filas individuales */}
                {items.map((row, index) => {
                  const showRow = Number(row.toppings || 0) > 0 || row.delivery

                  if (!showRow) return null

                  const rowSubtotal =
                    size.basePrice +
                    Number(row.toppings || 0) +
                    (row.delivery ? Number(size.delivery || 0) : 0)


                  return (
                    <div key={index} style={{ marginTop: "10px" }}>
                      <div className="size-row" style={{ fontWeight: "600" }}>
                        <span>Toppings:</span>
                      </div>

                      <div className="size-row">
                        <input
                          type="text"
                          className="input"
                          value={row.toppings}
                          onChange={(e) =>
                            handleRowPatch(size.id, index, { toppings: e.target.value })
                          }
                        />

                        <span style={{ marginLeft: "16px" }}>
                          Domicilio:{" "}
                          <input
                            type="checkbox"
                            checked={row.delivery}
                            onChange={(e) =>
                              handleRowPatch(size.id, index, { delivery: e.target.checked })
                            }
                          />
                        </span>
                      </div>

                      <div className="size-row">
                        <span>{formatMoney(rowSubtotal)}</span>
                      </div>
                    </div>
                  )
                })}

                <div className="size-row subtotal" style={{ fontSize: "22px", marginTop: "10px" }}>
                  <span>Subtotal:</span>
                  <span>{formatMoney(cardSubtotal)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="total-section">
          <div className="total-label">Total</div>
          <div className="total-input">{formatMoney(totalGeneral)}</div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={onConfirm} disabled={totalGeneral === 0}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
