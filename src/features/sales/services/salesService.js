import api from "../../../shared/services/api";
import { checkoutCart } from "../../cart/services/cartService";
import { getDeviceId } from "../../../shared/services/deviceId";

export async function getLatestSales() {
  const res = await api.get("/api/sales/latest");
  return res.data;
}

export async function registerSale(cartItems) {
  void cartItems;
  return checkoutCart({
    deviceId: getDeviceId(),
  });
}
