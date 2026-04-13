import api from "../../../shared/services/api";
import {
  isNetworkError,
  readJsonStorage,
  writeJsonStorage,
} from "../../../shared/services/localStorage";

const PRODUCTS_CACHE_KEY = "tropical.products.cache.v1";

export async function getProducts() {
  try {
    const res = await api.get("/api/products");
    writeJsonStorage(PRODUCTS_CACHE_KEY, res.data);
    return res.data;
  } catch (error) {
    if (!isNetworkError(error)) {
      throw error;
    }

    const cached = readJsonStorage(PRODUCTS_CACHE_KEY, []);
    if (Array.isArray(cached) && cached.length) {
      return cached;
    }

    throw error;
  }
}
