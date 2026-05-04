import { useCallback, useState } from "react";

function resolveProductName(item) {
  return (
    item.productName ??
    item.product_name ??
    item.nombre_producto ??
    item.producto_nombre ??
    item.nombre ??
    item.name ??
    item.sabor ??
    ""
  );
}

/**
 * Hook para encapsular la carga y transformación de productos
 * - originalProducts: data plana del backend
 * - products: agrupado por sabor_id + carac_id
 * - matrix: mapa {`${sabor_id}-${carac_id}-${tamano_id}`: {valor, delivery}}
 */
export function useProductsData(getProductsFn) {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [matrix, setMatrix] = useState({});

  const loadProducts = useCallback(async () => {
    const data = await getProductsFn();

    setOriginalProducts(data);

    // Agrupación por producto base (sabor + característica)
    const grouped = Object.values(
      data.reduce((acc, item) => {
        const key = `${item.sabor_id}-${item.carac_id}`;

        if (!acc[key]) {
          acc[key] = {
            id: key,
            machineId: item.machineId ?? null,
            machineName: item.machineName ?? "",
            sabor_id: item.sabor_id,
            carac_id: item.carac_id,
            name: resolveProductName(item),
            imageUrl: item.imageUrl,
            caracteristica: item.caracteristica,
            precios: [],
          };
        }

        acc[key].precios.push(item);
        return acc;
      }, {}),
    );

    setProducts(grouped);

    // Matrix de precios y delivery por combinación
    const map = {};
    data.forEach((p) => {
      const key = `${p.sabor_id}-${p.carac_id}-${p.tamano_id}`;
      map[key] = {
        valor: Number(p.valor),
        delivery: Number(p.delivery || 0),
      };
    });
    setMatrix(map);
  }, [getProductsFn]);

  return {
    products,
    originalProducts,
    matrix,
    loadProducts,
    setProducts,
    setOriginalProducts,
    setMatrix,
  };
}
