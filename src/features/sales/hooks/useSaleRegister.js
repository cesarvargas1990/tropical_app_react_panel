import { useCallback } from "react";
import Swal from "sweetalert2";

/**
 * Hook para registrar ventas con feedback visual
 */
export function useSaleRegister({ registerSale }) {
  const register = useCallback(
    async (cartItems, options) => {
      return registerSale(cartItems, options);
    },
    [registerSale],
  );

  const showSuccess = useCallback(async (result) => {
    const isPending = Boolean(result?.pending);

    await Swal.fire({
      title: isPending
        ? "Venta guardada sin conexión"
        : "Venta registrada con éxito",
      text: isPending
        ? "La venta quedó pendiente y se enviará cuando regrese el internet."
        : undefined,
      icon: isPending ? "warning" : "success",
      width: 500,
      timer: isPending ? 1800 : 1200,
      showConfirmButton: false,
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "999999";
      },
    });

    return true;
  }, []);

  return { register, showSuccess };
}
