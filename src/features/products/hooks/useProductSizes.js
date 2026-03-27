import { useCallback } from "react";

/**
 * Hook para obtener tamaños disponibles de un producto
 */
export function useProductSizes(originalProducts) {
  const getSizesFor = useCallback(
    (product) => {
      const filtered = originalProducts.filter(
        (p) =>
          String(p.sabor_id) === String(product.sabor_id) &&
          String(p.carac_id) === String(product.carac_id),
      );

      const unique = Object.values(
        filtered.reduce((acc, p) => {
          const sizeId = String(p.tamano_id);
          if (!acc[sizeId]) {
            acc[sizeId] = {
              id: p.tamano_id,
              nombre: p.tamano,
              basePrice: Number(p.valor),
              delivery: Number(p.delivery || 0),
              carac_id: p.carac_id,
            };
          }
          return acc;
        }, {}),
      );

      return unique;
    },
    [originalProducts],
  );

  return { getSizesFor };
}
