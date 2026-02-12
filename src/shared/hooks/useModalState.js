import { useState } from "react";

/**
 * Hook para manejar el estado de los modales de la aplicación
 */
export function useModalState() {
  const [showCart, setShowCart] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const openCart = () => setShowCart(true);
  const closeCart = () => setShowCart(false);
  const toggleCart = () => setShowCart((prev) => !prev);

  const openRecent = () => setShowRecent(true);
  const closeRecent = () => setShowRecent(false);
  const toggleRecent = () => setShowRecent((prev) => !prev);

  return {
    showCart,
    showRecent,
    openCart,
    closeCart,
    toggleCart,
    openRecent,
    closeRecent,
    toggleRecent,
  };
}
