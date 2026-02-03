import { useEffect } from "react";

// Activa socket (side-effect)
import "../../../../socket.js";

/**
 * Hook para escuchar eventos en tiempo real de productos
 * Actualiza la lista cuando hay cambios desde el backend
 */
export function useProductsRealtime({ onReload, onAddProduct, onOpenCart } = {}) {
  const extractProductId = (message) => {
    if (!message) return null;
    const match = String(message).match(/productid\s*(\d+)/i);
    if (match && match[1]) return Number(match[1]);
    return null;
  };

  useEffect(() => {
    console.log("▶ Listening to realtime changes...");

    const channel = window.Echo.channel("new-public-channel");
    channel.listen("NewEvent", (e) => {
      console.log("🔥 Evento recibido vía socket:", e);
      onReload?.();

      const productId = extractProductId(e?.message);
      if (productId && onAddProduct) {
        const added = onAddProduct(productId);
        if (added && onOpenCart) {
          onOpenCart();
        }
      }

    });

    return () => {
      channel.stopListening("NewEvent");
    };
  }, [onReload, onAddProduct, onOpenCart]);
}
