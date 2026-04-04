import api from "../../../shared/services/api";

export async function getDirectAccessProductsConfig() {
  const res = await api.get("/api/products/direct-access");
  return res.data;
}
