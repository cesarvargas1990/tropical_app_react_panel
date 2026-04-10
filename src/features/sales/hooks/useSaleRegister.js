import { useCallback } from "react";
import Swal from "sweetalert2";

/**
 * Hook para registrar ventas con feedback visual
 */
export function useSaleRegister({ registerSale }) {
  const register = useCallback(
    async (cartItems) => {
      return registerSale(cartItems);
    },
    [registerSale],
  );

  const showSuccess = useCallback(async () => {
    await Swal.fire({
      title: "Venta registrada con éxito",
      icon: "success",
      width: 500,
      timer: 1200,
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
