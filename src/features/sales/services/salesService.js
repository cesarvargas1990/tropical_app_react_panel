import api from "../../../shared/services/api";
import { checkoutCart } from "../../cart/services/cartService";
import { getDeviceId } from "../../../shared/services/deviceId";

export async function getLatestSales() {
  const userId = Number(localStorage.getItem("auth_user_id") || 0);
  const res = await api.get("/api/sales/latest", {
    params: userId > 0 ? { user_id: userId } : {},
  });
  return res.data;
}

export async function registerSale(cartItems) {
  void cartItems;
  return checkoutCart({
    deviceId: getDeviceId(),
  });
}
