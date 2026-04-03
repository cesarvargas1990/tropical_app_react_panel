import { useCallback } from "react";

/**
 * Hook para manejar las acciones del carrito en MainApp
 */
export function useCartActions({ cart, register, closeCart }) {
  const handleRegisterSale = useCallback(async () => {
    try {
      await register(cart.groupedItems);
      await cart.syncCart?.();
      closeCart();
      return true;
    } catch (error) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
      return false;
    }
  }, [cart, register, closeCart]);

  const handleEditItem = useCallback(
    (item, index) => {
      const idx =
        index ??
        item?.sourceItemId ??
        item?.sourceIndex ??
        (item?.sourceItemIds
          ? item.sourceItemIds[0]
          : item?.sourceIndices
            ? item.sourceIndices[0]
            : null);
      if (idx === null || idx === undefined) return;

      const res = cart.startEditItem(item, idx);
      if (!res.ok) return;
      closeCart();
    },
    [cart, closeCart],
  );

  const cartButtonDisabled = cart.cartItems.length === 0;

  return {
    handleRegisterSale,
    handleEditItem,
    cartButtonDisabled,
  };
}
