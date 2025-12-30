import { useCallback } from "react"

export function useProductSizes(originalProducts) {
  const getSizesFor = useCallback((product) => {
    const filtered = originalProducts.filter(
      (p) => p.sabor_id === product.sabor_id && p.carac_id === product.carac_id
    )

    const unique = Object.values(
      filtered.reduce((acc, p) => {
        if (!acc[p.tamano_id]) {
          acc[p.tamano_id] = {
            id: p.tamano_id,
            nombre: p.tamano,
            basePrice: Number(p.valor),
            delivery: Number(p.delivery || 0),
            carac_id: p.carac_id,
          }
        }
        return acc
      }, {})
    )

    return unique
  }, [originalProducts])

  return { getSizesFor }
}
