/**
 * Hook para cálculos de precios en el modal de tamaños
 */
export function useSizeCalculations() {
  const formatMoney = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value)

  const getSizeSubtotal = (size, sizeState) => {
    const st = sizeState[size.id]
    if (!st || !st.items || !st.items.length) return 0

    return st.items.reduce((sum, row) => {
      const t = Number(row.toppings || 0)
      const d = row.delivery ? Number(size.delivery || 0) : 0
      return sum + size.basePrice + t + d
    }, 0)
  }

  const getRowSubtotal = (size, row) => {
    return (
      size.basePrice +
      Number(row.toppings || 0) +
      (row.delivery ? Number(size.delivery || 0) : 0)
    )
  }

  const getTotalGeneral = (sizes, sizeState) => {
    return sizes.reduce((sum, s) => sum + getSizeSubtotal(s, sizeState), 0)
  }

  return {
    formatMoney,
    getSizeSubtotal,
    getRowSubtotal,
    getTotalGeneral,
  }
}
