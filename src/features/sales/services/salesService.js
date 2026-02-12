import api from "../../../shared/services/api";

export async function getLatestSales() {
  const res = await api.get("/api/sales/latest");
  return res.data;
}

export async function registerSale(cartItems) {
  const res = await api.post("/api/sales", cartItems);
  return res.data;
}
