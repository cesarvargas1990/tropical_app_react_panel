/**
 * Hook para manejar las actualizaciones de estado de tamaños en el modal
 */
export function useSizeUpdates({ sizeState, onUpdateSize }) {
  const handleQuantityChange = (sizeId, delta) => {
    const current = sizeState[sizeId] || {
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

  const handleGlobalDeliveryChange = (sizeId, checked) => {
    const current = sizeState[sizeId] || {
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
    const current = sizeState[sizeId] || {
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

  return {
    handleQuantityChange,
    handleGlobalDeliveryChange,
    handleRowPatch,
  }
}
