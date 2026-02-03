import { useCallback } from "react"

/**
 * Hook para manejar las acciones relacionadas con productos desde el scanner o socket
 */
export function useProductActions({ originalProducts, cart, onCartOpen }) {
  const addProductFromSocket = useCallback(
    (productId) => {
      const match = originalProducts.find(
        (p) =>
          String(p.productMatrixId ?? "") === String(productId) ||
          String(p.id ?? "") === String(productId) ||
          String(p.producto_id ?? "") === String(productId)
      )

      if (!match) {
        console.warn("Producto no encontrado para socket id:", productId)
        return false
      }

      cart.addItemDirect(match, { fromSocket: true })
      return true
    },
    [originalProducts, cart]
  )

  const handleScannerSubmit = useCallback(
    (value) => {
      const ok = addProductFromSocket(value)
      if (ok) onCartOpen?.()
    },
    [addProductFromSocket, onCartOpen]
  )

  return {
    addProductFromSocket,
    handleScannerSubmit,
  }
}
