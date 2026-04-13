export function readJsonStorage(key, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn(`No se pudo leer localStorage para ${key}`, error);
    return fallbackValue;
  }
}

export function writeJsonStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`No se pudo escribir localStorage para ${key}`, error);
  }
}

export function removeStorageKey(key) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`No se pudo eliminar localStorage para ${key}`, error);
  }
}

export function isNavigatorOnline() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine !== false;
}

export function isNetworkError(error) {
  if (!error) {
    return false;
  }

  const status = error?.response?.status;
  const message = String(error?.message ?? "").toLowerCase();
  const code = String(error?.code ?? "").toUpperCase();

  if (status === 0) {
    return true;
  }

  if (
    code === "ERR_NETWORK" ||
    code === "ERR_INTERNET_DISCONNECTED" ||
    message === "network error" ||
    message.includes("failed to fetch") ||
    message.includes("load failed") ||
    message.includes("networkerror") ||
    message.includes("internet disconnected")
  ) {
    return true;
  }

  return !error.response;
}
