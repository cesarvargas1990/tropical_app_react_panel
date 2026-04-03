const DEVICE_ID_KEY = "tropical_device_id";

function generateUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return template.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
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
