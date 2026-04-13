import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isNavigatorOnline,
  isNetworkError,
  readJsonStorage,
  removeStorageKey,
  writeJsonStorage,
} from "../../src/shared/services/localStorage";

describe("localStorage service", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("escribe y lee JSON desde localStorage", () => {
    writeJsonStorage("test-key", { ok: true, total: 2 });

    expect(readJsonStorage("test-key", null)).toEqual({
      ok: true,
      total: 2,
    });
  });

  it("retorna fallback cuando no existe el valor", () => {
    expect(readJsonStorage("missing-key", [])).toEqual([]);
  });

  it("retorna fallback y avisa cuando el JSON es invalido", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem("broken-key", "{");

    expect(readJsonStorage("broken-key", { fallback: true })).toEqual({
      fallback: true,
    });
    expect(warnSpy).toHaveBeenCalled();
  });

  it("elimina una llave del storage", () => {
    window.localStorage.setItem("delete-me", JSON.stringify({ ok: true }));

    removeStorageKey("delete-me");

    expect(window.localStorage.getItem("delete-me")).toBeNull();
  });

  it("detecta correctamente el estado online del navegador", () => {
    vi.stubGlobal("navigator", { onLine: true });
    expect(isNavigatorOnline()).toBe(true);

    vi.stubGlobal("navigator", { onLine: false });
    expect(isNavigatorOnline()).toBe(false);
  });

  it("detecta errores de red comunes", () => {
    expect(isNetworkError({ code: "ERR_NETWORK" })).toBe(true);
    expect(isNetworkError({ message: "Network Error" })).toBe(true);
    expect(isNetworkError({})).toBe(true);
    expect(isNetworkError({ response: { status: 500 } })).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
