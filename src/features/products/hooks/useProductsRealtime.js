import { useEffect } from "react";

// Activa socket (side-effect)
import "../../../../socket.js";

/**
 * Hook para escuchar eventos en tiempo real de productos
 * Actualiza la lista cuando hay cambios desde el backend
 */
export function useProductsRealtime({
  onReload,
  onDirectAccessReload,
  onLegacyProductEvent,
  onCartUpdated,
} = {}) {
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
      onDirectAccessReload?.();

      const productId = extractProductId(e?.message);
      if (productId) {
        onLegacyProductEvent?.({
          productId,
          rawEvent: e,
        });
      }
    });

    channel.listen("CartUpdated", (e) => {
      console.log("🛒 CartUpdated recibido vía socket:", e);
      onCartUpdated?.(e);
    });

    return () => {
      channel.stopListening("NewEvent");
      channel.stopListening("CartUpdated");
    };
  }, [onReload, onDirectAccessReload, onLegacyProductEvent, onCartUpdated]);
}
