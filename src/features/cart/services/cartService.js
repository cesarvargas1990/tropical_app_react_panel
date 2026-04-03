import api from "../../../shared/services/api";
import {
  createMutationId,
  getDeviceId,
} from "../../../shared/services/deviceId";

function unwrapPayload(payload) {
  if (payload?.data) {
    return payload.data;
  }

  return payload;
}

function unwrapCart(payload) {
  const data = unwrapPayload(payload);
  return data?.cart ?? data;
}

export async function getActiveCart(deviceId = getDeviceId()) {
  const response = await api.get("/api/cart/active", {
    params: {
      device_id: deviceId,
    },
  });

  return unwrapCart(response.data);
}

export async function scanCartItem({
  deviceId = getDeviceId(),
  productMatrixId,
  barcode,
  mutationUuid = createMutationId(),
}) {
  const response = await api.post("/api/cart/active/items/scan", {
    device_id: deviceId,
    productMatrixId,
    barcode,
    mutation_uuid: mutationUuid,
  });

  return unwrapCart(response.data);
}

export async function addCartItems({
  deviceId = getDeviceId(),
  items,
  source = "manual",
  mutationUuid = createMutationId(),
}) {
  const response = await api.post("/api/cart/active/items", {
    device_id: deviceId,
    source,
    mutation_uuid: mutationUuid,
    items,
  });

  return unwrapCart(response.data);
}

export async function removeCartItem({
  deviceId = getDeviceId(),
  itemId,
  mutationUuid = createMutationId(),
}) {
  const response = await api.delete(`/api/cart/items/${itemId}`, {
    data: {
      device_id: deviceId,
      mutation_uuid: mutationUuid,
    },
  });

  return unwrapCart(response.data);
}

export async function clearActiveCart({
  deviceId = getDeviceId(),
  mutationUuid = createMutationId(),
}) {
  const response = await api.delete("/api/cart/active/items", {
    data: {
      device_id: deviceId,
      mutation_uuid: mutationUuid,
    },
  });

  return unwrapCart(response.data);
}

export async function checkoutCart({
  deviceId = getDeviceId(),
  mutationUuid = createMutationId(),
}) {
  const response = await api.post("/api/cart/checkout", {
    device_id: deviceId,
    mutation_uuid: mutationUuid,
  });

  return unwrapPayload(response.data);
}
