const DEVICE_ID_KEY = "tropical_device_id";

function generateUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error(
      "Secure random UUID generation is not available in this environment.",
    );
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

export function getDeviceId() {
  const configuredDeviceId = import.meta.env.VITE_DEVICE_ID;
  if (configuredDeviceId) {
    return String(configuredDeviceId);
  }

  if (typeof window === "undefined") {
    return "server-device";
  }

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = `tablet-${generateUuid()}`;
  window.localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

export function createMutationId() {
  return generateUuid();
}
