import api from "../../../shared/services/api";

export async function getProducts() {
  const res = await api.get("/api/products");
  return res.data;
}
