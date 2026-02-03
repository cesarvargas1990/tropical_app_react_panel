import { useCallback } from "react"

/**
 * Hook para manejar las acciones del carrito en MainApp
 */
export function useCartActions({ cart, register, closeCart }) {
  const handleRegisterSale = useCallback(async () => {
    try {
      await register(cart.groupedItems)
      cart.clearCart()
      closeCart()
    } catch (error) {
      const Swal = (await import("sweetalert2")).default
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      })
    }
  }, [cart, register, closeCart])

  const handleEditItem = useCallback(
    (item, index) => {
      const idx =
        index ??
        item?.sourceIndex ??
        (item?.sourceIndices ? item.sourceIndices[0] : null)
      if (idx === null || idx === undefined) return

      const res = cart.startEditItem(item, idx)
      if (!res.ok) return
      closeCart()
    },
    [cart, closeCart]
  )

  const cartButtonDisabled = cart.cartItems.length === 0

  return {
    handleRegisterSale,
    handleEditItem,
    cartButtonDisabled,
  }
}
