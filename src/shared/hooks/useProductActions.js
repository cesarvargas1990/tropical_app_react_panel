import { useCallback } from "react";

/**
 * Hook para manejar las acciones relacionadas con productos desde el scanner o socket
 */
export function useProductActions({ originalProducts, cart, onCartOpen }) {
  const addProductFromSocket = useCallback(
    async (productId) => {
      const match = originalProducts.find(
        (p) =>
          String(p.productMatrixId ?? "") === String(productId) ||
          String(p.id ?? "") === String(productId) ||
          String(p.producto_id ?? "") === String(productId),
      );

      if (!match) {
        console.warn("Producto no encontrado para socket id:", productId);
        return false;
      }

      const added = await cart.addItemDirect(match, { fromSocket: true });
      if (added) {
        onCartOpen?.();
      }
      return added;
    },
    [originalProducts, cart, onCartOpen],
  );

  const handleScannerSubmit = useCallback(
    async (value) => {
      await addProductFromSocket(value);
    },
    [addProductFromSocket],
  );

  return {
    addProductFromSocket,
    handleScannerSubmit,
  };
}
