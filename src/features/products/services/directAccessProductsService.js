import api from "../../../shared/services/api";
import {
  isNetworkError,
  readJsonStorage,
  writeJsonStorage,
} from "../../../shared/services/localStorage";

const DIRECT_ACCESS_CACHE_KEY = "tropical.directAccessProducts.cache.v1";

export async function getDirectAccessProductsConfig() {
  try {
    const res = await api.get("/api/products/direct-access");
    writeJsonStorage(DIRECT_ACCESS_CACHE_KEY, res.data);
    return res.data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    return readJsonStorage(DIRECT_ACCESS_CACHE_KEY, {
      productMatrixIds: [],
    });
  }
}
