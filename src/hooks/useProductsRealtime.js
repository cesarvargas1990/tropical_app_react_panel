import { useEffect } from "react";

// Activa socket (side-effect) - mantiene el mismo behavior que antes.
import "../../socket";

/**
 * Escucha el canal y recarga productos en tiempo real.
 *
 * @param {{ onReload?: Function, onAddProduct?: Function, onOpenCart?: Function }} config
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
