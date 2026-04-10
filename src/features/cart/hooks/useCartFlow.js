import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCartItems, buildEditSizeState } from "../utils/cartBuilder";
import {
  addCartItems,
  clearActiveCart,
  getActiveCart,
  removeCartItem as removeCartItemRequest,
  scanCartItem,
} from "../services/cartService";
import { getDeviceId } from "../../../shared/services/deviceId";

/**
 * Hook principal para manejar todo el flujo del carrito
 * Encapsula lógica de: selección, edición, confirmación, agrupación
 */

let sharedAudioCtx = null;
let optimisticItemCounter = 0;

export function useCartFlow({
  originalProducts,
  matrix,
  getSizesFor,
  products,
}) {
  const deviceId = useMemo(() => getDeviceId(), []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sizeState, setSizeState] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [cartVersion, setCartVersion] = useState(0);
  const [cartStatus, setCartStatus] = useState("active");
  const [editIndex, setEditIndex] = useState(null);
  const [editSourceItemIds, setEditSourceItemIds] = useState([]);
  const syncPromiseRef = useRef(null);
  const pendingOptimisticItemsRef = useRef(new Map());
  const cartVersionRef = useRef(0);

  const showCartError = useCallback(async (error, fallbackMessage) => {
    const Swal = (await import("sweetalert2")).default;
    await Swal.fire({
      title: "Error",
      text: error?.response?.data?.message || error?.message || fallbackMessage,
      icon: "error",
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "999999";
      },
    });
  }, []);

  const productByMatrixId = useMemo(() => {
    return new Map(
      originalProducts.map((product) => [
        String(product.productMatrixId ?? product.id),
        product,
      ]),
    );
  }, [originalProducts]);

  const enrichCartItem = useCallback(
    (item) => {
      const match = productByMatrixId.get(String(item.productMatrixId ?? ""));

      return {
        ...item,
        size:
          item.size ??
          item.sizeId ??
          match?.tamano_id ??
          match?.tamanoId ??
          null,
      };
    },
    [productByMatrixId],
  );

  useEffect(() => {
    cartVersionRef.current = Number(cartVersion ?? 0);
  }, [cartVersion]);

  const mergePendingOptimisticItems = useCallback((serverItems) => {
    const pendingItems = Array.from(pendingOptimisticItemsRef.current.values());
    if (!pendingItems.length) {
      return serverItems;
    }

    return [...serverItems, ...pendingItems];
  }, []);

  const hydrateCart = useCallback(
    (serverCart, { preserveOptimistic = false } = {}) => {
      const nextCart = serverCart ?? {};
      const nextVersion = Number(nextCart.version ?? 0);
      const currentVersion = Number(cartVersionRef.current ?? 0);

      if (nextVersion < currentVersion) {
        return nextCart;
      }

      const nextItems = (nextCart.items ?? []).map(enrichCartItem);
      const mergedItems = preserveOptimistic
        ? mergePendingOptimisticItems(nextItems)
        : nextItems;

      setCartId(nextCart.id ?? null);
      setCartVersion(nextVersion);
      setCartStatus(nextCart.status ?? "active");
      setCartItems(mergedItems);
      return nextCart;
    },
    [enrichCartItem, mergePendingOptimisticItems],
  );
  const playBeep = useCallback(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    try {
      if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
        sharedAudioCtx = new AudioCtx();
      }

      const ctx = sharedAudioCtx;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = "square";
      osc.frequency.setValueAtTime(1500, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("No se pudo reproducir beep123", e);
    }
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const syncCart = useCallback(async () => {
    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    syncPromiseRef.current = getActiveCart(deviceId)
      .then((serverCart) =>
        hydrateCart(serverCart, { preserveOptimistic: true }),
      )
      .finally(() => {
        syncPromiseRef.current = null;
      });

    return syncPromiseRef.current;
  }, [deviceId, hydrateCart]);

  useEffect(() => {
    void syncCart();

    const handleOnline = () => {
      void syncCart();
    };

    const handleFocus = () => {
      void syncCart();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void syncCart();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncCart]);

  useEffect(() => {
    setCartItems((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const next = prev.map(enrichCartItem);
      const changed = next.some(
        (item, index) => item.size !== prev[index]?.size,
      );

      return changed ? next : prev;
    });
  }, [enrichCartItem]);

  const resolvedSizes = useMemo(() => {
    if (!selectedProduct) return [];
    return getSizesFor(selectedProduct);
  }, [getSizesFor, selectedProduct, originalProducts]);

  const groupKey = useCallback((item) => {
    return JSON.stringify({
      productMatrixId: item.productMatrixId,
      productName: item.productName,
      size: item.size,
      sizeLabel: item.sizeLabel,
      unitPrice: item.unitPrice,
      toppings: item.toppings,
      delivery: item.delivery,
    });
  }, []);

  const groupedItems = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      const key = groupKey(item);
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          sourceItemIds: item.id ? [item.id] : [],
          sourceItemId: item.id ?? null,
        });
      } else {
        const current = map.get(key);
        current.quantity += item.quantity;
        current.toppings += item.toppings;
        current.delivery += item.delivery;
        current.subtotal += item.subtotal;
        if (item.id) {
          current.sourceItemIds.push(item.id);
        }
      }
    });
    return Array.from(map.values());
  }, [cartItems, groupKey]);

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setSizeState({});
  }, []);

  const updateSize = useCallback((id, data) => {
    setSizeState((prev) => ({ ...prev, [id]: data }));
  }, []);

  const removeItemIds = useCallback(
    async (itemIds) => {
      let latestCart = null;

      for (const itemId of itemIds) {
        latestCart = await removeCartItemRequest({
          deviceId,
          itemId,
        });
      }

      if (latestCart) {
        hydrateCart(latestCart);
      }

      return latestCart;
    },
    [deviceId, hydrateCart],
  );

  const buildOptimisticDirectItem = useCallback(
    (product) => {
      const productMatrixId = Number(
        product?.productMatrixId ?? product?.id ?? 0,
      );
      const unitPrice = Number(product?.valor ?? 0);
      const flavor = product?.sabor ?? product?.name ?? "Producto";
      const feature = product?.caracteristica ?? null;
      const sizeLabel = product?.tamano ?? product?.sizeLabel ?? "";
      const productName = feature ? `${flavor} (${feature})` : flavor;

      optimisticItemCounter += 1;

      return enrichCartItem({
        id: `optimistic-${productMatrixId}-${optimisticItemCounter}`,
        productMatrixId,
        machineId: product?.machineId ?? null,
        maquinaConfId: product?.maquinaConfId ?? null,
        productName,
        sizeLabel,
        quantity: 1,
        unitPrice,
        toppings: 0,
        delivery: 0,
        subtotal: unitPrice,
        source: "scanner",
      });
    },
    [enrichCartItem],
  );

  const confirmSizes = useCallback(async () => {
    const newItems = buildCartItems({
      sizes: resolvedSizes,
      sizeState,
      selectedProduct,
      originalProducts,
      matrix,
    });

    if (!newItems.length) return false;

    try {
      if (editIndex !== null) {
        const itemIds = (
          editSourceItemIds.length ? editSourceItemIds : []
        ).filter(Boolean);
        if (itemIds.length) {
          await removeItemIds(itemIds);
        }
      }

      const serverCart = await addCartItems({
        deviceId,
        items: newItems,
        source: "manual",
      });

      hydrateCart(serverCart);
      setSelectedProduct(null);
      setSizeState({});
      setEditIndex(null);
      setEditSourceItemIds([]);
      return true;
    } catch (error) {
      await showCartError(error, "No se pudo actualizar el carrito.");
      return false;
    }
  }, [
    resolvedSizes,
    sizeState,
    selectedProduct,
    originalProducts,
    matrix,
    editIndex,
    editSourceItemIds,
    removeItemIds,
    deviceId,
    hydrateCart,
    showCartError,
  ]);

  const removeCartItem = useCallback(
    async (itemId) => {
      try {
        const serverCart = await removeCartItemRequest({
          deviceId,
          itemId,
        });
        hydrateCart(serverCart);
        return true;
      } catch (error) {
        await showCartError(error, "No se pudo eliminar el item del carrito.");
        return false;
      }
    },
    [deviceId, hydrateCart, showCartError],
  );

  const clearCart = useCallback(async () => {
    try {
      const serverCart = await clearActiveCart({ deviceId });
      hydrateCart(serverCart);
      return true;
    } catch (error) {
      await showCartError(error, "No se pudo limpiar el carrito.");
      return false;
    }
  }, [deviceId, hydrateCart, showCartError]);

  const resetCart = useCallback(() => {
    pendingOptimisticItemsRef.current.clear();
    hydrateCart({
      id: cartId,
      device_id: deviceId,
      status: "active",
      version: cartVersionRef.current,
      items_count: 0,
      subtotal: 0,
      currency_code: "COP",
      items: [],
    });
  }, [cartId, deviceId, hydrateCart]);

  const removeGroup = useCallback(
    async (item) => {
      const itemIds = (item?.sourceItemIds ?? []).filter(Boolean);

      if (!itemIds.length && item?.id) {
        return removeCartItem(item.id);
      }

      try {
        await removeItemIds(itemIds);
        return true;
      } catch (error) {
        await showCartError(error, "No se pudo eliminar el grupo del carrito.");
        return false;
      }
    },
    [removeCartItem, removeItemIds, showCartError],
  );

  const startEditItem = useCallback(
    (item, index) => {
      const product =
        productByMatrixId.get(String(item.productMatrixId ?? "")) ??
        products.find(
          (p) =>
            p.name === (item.productName?.split(" (")[0] ?? item.productName),
        );
      if (!product) return { ok: false };

      setSelectedProduct(product);
      const itemIds = item?.sourceItemIds?.length
        ? item.sourceItemIds
        : [item?.id].filter(Boolean);
      setEditIndex(index ?? 0);
      setEditSourceItemIds(
        itemIds.filter((itemId) => itemId !== null && itemId !== undefined),
      );
      setSizeState(buildEditSizeState(item));

      return { ok: true };
    },
    [productByMatrixId, products],
  );

  const setSizes = useCallback(() => {}, []);

  const finishEditCancel = useCallback(() => {
    setSelectedProduct(null);
    setEditIndex(null);
    setEditSourceItemIds([]);
  }, []);

  const addItemDirect = useCallback(
    async (product, { fromSocket = false } = {}) => {
      if (!product) return false;

      const optimisticItem = buildOptimisticDirectItem(product);
      pendingOptimisticItemsRef.current.set(optimisticItem.id, optimisticItem);
      setCartItems((prev) => [...prev, optimisticItem]);

      try {
        const serverCart = await scanCartItem({
          deviceId,
          productMatrixId: product.productMatrixId ?? product.id ?? null,
        });

        pendingOptimisticItemsRef.current.delete(optimisticItem.id);
        hydrateCart(serverCart, { preserveOptimistic: true });
        if (fromSocket) playBeep();
        return true;
      } catch (error) {
        pendingOptimisticItemsRef.current.delete(optimisticItem.id);
        setCartItems((prev) =>
          prev.filter((item) => item.id !== optimisticItem.id),
        );
        await showCartError(
          error,
          "No se pudo agregar el producto al carrito.",
        );
        return false;
      }
    },
    [buildOptimisticDirectItem, deviceId, hydrateCart, playBeep, showCartError],
  );

  return {
    // state
    deviceId,
    cartId,
    cartVersion,
    cartStatus,
    sizes: resolvedSizes,
    selectedProduct,
    sizeState,
    cartItems,
    editIndex,
    editSourceItemIds,
    cartCount,

    // setters/handlers
    setSizes,
    setSelectedProduct,
    setSizeState,
    setCartItems,
    setEditIndex,
    setEditSourceItemIds,

    selectProduct,
    updateSize,
    syncCart,
    hydrateCart,
    confirmSizes,
    removeCartItem,
    clearCart,
    resetCart,
    removeGroup,
    startEditItem,
    finishEditCancel,
    addItemDirect,
    groupedItems,
  };
}
