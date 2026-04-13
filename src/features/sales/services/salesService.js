import api from "../../../shared/services/api";
import { checkoutCart, clearActiveCart } from "../../cart/services/cartService";
import { getDeviceId } from "../../../shared/services/deviceId";
import {
  cacheLatestSales,
  queuePendingSale,
  readCachedLatestSales,
  rememberSaleLocally,
  registerSaleDirect,
  syncPendingSales,
} from "./offlineSalesStore";
import {
  isNavigatorOnline,
  isNetworkError,
} from "../../../shared/services/localStorage";

export async function getLatestSales() {
  try {
    const res = await api.get("/api/sales/latest");
    cacheLatestSales(
      (Array.isArray(res.data) ? res.data : []).map((sale) => ({
        ...sale,
        __offline: Number(sale.offline ?? 0) === 1,
        __unsynced: false,
      })),
    );
    return readCachedLatestSales();
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    return readCachedLatestSales();
  }
}

export async function registerSale(cartItems, options = {}) {
  const deviceId = options.deviceId ?? getDeviceId();
  const items = Array.isArray(cartItems) ? cartItems : [];
  const mustUseDirectApi = Boolean(
    options.forceDirectApi || options.hasLocalOnlyItems,
  );

  if (!isNavigatorOnline()) {
    queuePendingSale(items, {
      deviceId,
      clearServerCartAfterSync: true,
    });
    return {
      success: true,
      pending: true,
      shouldSyncCart: false,
      mode: "queued",
    };
  }

  if (mustUseDirectApi) {
    try {
      const result = await registerSaleDirect(items);
      rememberSaleLocally(items, {
        offlineSale: false,
      });

      if (options.clearServerCartAfterDirectSync !== false) {
        try {
          await clearActiveCart({ deviceId });
        } catch (error) {
          if (!isNetworkError(error)) {
            console.warn(
              "No se pudo limpiar carrito luego de sincronizar venta",
              error,
            );
          }
        }
      }

      return {
        ...result,
        pending: false,
        shouldSyncCart: true,
        mode: "direct-api",
      };
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      queuePendingSale(items, {
        deviceId,
        clearServerCartAfterSync:
          options.clearServerCartAfterDirectSync !== false,
      });
      return {
        success: true,
        pending: true,
        shouldSyncCart: false,
        mode: "queued",
      };
    }
  }

  try {
    const result = await checkoutCart({ deviceId });
    rememberSaleLocally(items, {
      offlineSale: false,
    });
    return {
      ...result,
      pending: false,
      shouldSyncCart: true,
      mode: "checkout",
    };
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    queuePendingSale(items, {
      deviceId,
      clearServerCartAfterSync: true,
    });
    return {
      success: true,
      pending: true,
      shouldSyncCart: false,
      mode: "queued",
    };
  }
}

export { syncPendingSales };
