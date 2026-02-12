/**
 * Construye los items del carrito a partir del estado del modal de tamaños.
 * Mantiene la misma lógica del MainApp original.
 */
export function buildCartItems({
  sizes,
  sizeState,
  selectedProduct,
  originalProducts,
  matrix,
}) {
  const newItems = [];

  if (!selectedProduct) return newItems;

  sizes.forEach((s) => {
    const state = sizeState[s.id];
    if (!state || (state.quantity || 0) <= 0) return;

    const key = `${selectedProduct.sabor_id}-${s.carac_id}-${s.id}`;
    const unitPrice = matrix[key]?.valor ?? s.basePrice;
    const deliveryPrice = matrix[key]?.delivery ?? s.delivery ?? 0;

    let subtotal = 0;
    let toppingsTotal = 0;
    let deliveryTotal = 0;

    if (state.items?.length) {
      state.items.forEach((row) => {
        const t = Number(row.toppings || 0);
        const d = row.delivery ? deliveryPrice : 0;
        subtotal += unitPrice + t + d;
        toppingsTotal += t;
        deliveryTotal += d;
      });
    } else {
      const q = state.quantity;
      const t = Number(state.toppings || 0);
      const d = state.delivery ? deliveryPrice : 0;
      subtotal = q * (unitPrice + t + d);
      toppingsTotal = q * t;
      deliveryTotal = q * d;
    }

    const match = originalProducts.find(
      (x) =>
        x.sabor_id === selectedProduct.sabor_id &&
        x.carac_id === selectedProduct.carac_id &&
        x.tamano_id === s.id,
    );

    const characteristic =
      selectedProduct.caracteristica ??
      selectedProduct.caracteristica_nombre ??
      selectedProduct.feature ??
      "";

    const productName = characteristic
      ? `${selectedProduct.name} (${characteristic})`
      : selectedProduct.name;

    newItems.push({
      productName,
      size: s.id,
      sizeLabel: s.nombre,
      quantity: state.items?.length || state.quantity,
      unitPrice,
      toppings: toppingsTotal,
      delivery: deliveryTotal,
      subtotal,
      machineId: match?.machineId ?? null,
      maquinaConfId: match?.maquinaConfId ?? null,
      productMatrixId: match?.productMatrixId ?? null,
    });
  });

  return newItems;
}

/**
 * Construye el state para edición (igual al handleEditItem original).
 */
export function buildEditSizeState(item) {
  const activeSizeId = item.size;
  return {
    __activeSizeId: activeSizeId,
    [activeSizeId]: {
      quantity: item.quantity,
      toppings: item.toppings,
      delivery: item.delivery > 0,
      items: Array.from({ length: item.quantity }).map(() => ({
        toppings: item.toppings,
        delivery: item.delivery > 0,
      })),
    },
  };
}
