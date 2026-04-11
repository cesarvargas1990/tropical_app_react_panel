import { describe, it, expect, vi, beforeEach } from "vitest";

const requestUse = vi.fn();
const responseUse = vi.fn();

vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: requestUse },
          response: { use: responseUse },
        },
      })),
    },
  };
});

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    getContainer: vi.fn(() => ({ style: {} })),
  },
}));

describe("api axios instance", () => {
  let requestInterceptor;
  let responseErrorInterceptor;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    globalThis.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    globalThis.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });

    await import("../../src/shared/services/api.js");

    expect(requestUse).toHaveBeenCalledTimes(1);
    expect(responseUse).toHaveBeenCalledTimes(1);

    requestInterceptor = requestUse.mock.calls[0][0];
    responseErrorInterceptor = responseUse.mock.calls[0][1];

    const Swal = (await import("sweetalert2")).default;
    Swal.fire.mockReset();
    Swal.getContainer.mockReset();
    Swal.getContainer.mockImplementation(() => ({ style: {} }));
  });

  it("NO agrega Authorization header si no hay token", async () => {
    localStorage.getItem.mockReturnValue(null);
    sessionStorage.getItem.mockReturnValue(null);

    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("agrega Authorization header si existe auth_token en localStorage", async () => {
    localStorage.getItem.mockReturnValue("token-123");
    sessionStorage.getItem.mockReturnValue(null);

    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe("Bearer token-123");
  });

  it("agrega Authorization header si existe auth_token en sessionStorage", async () => {
    localStorage.getItem.mockReturnValue(null);
    sessionStorage.getItem.mockReturnValue("token-session");

    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe("Bearer token-session");
  });

  it("no hace nada especial para errores != 401", async () => {
    const Swal = (await import("sweetalert2")).default;
    const error = { response: { status: 500 } };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(sessionStorage.removeItem).not.toHaveBeenCalled();
    expect(Swal.fire).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("para status 401 limpia auth en ambos storages, muestra alerta y redirige tras confirmar", async () => {
    const Swal = (await import("sweetalert2")).default;
    const container = { style: {} };
    Swal.getContainer.mockReturnValue(container);
    Swal.fire.mockImplementation(async (options) => {
      options?.didOpen?.();
      return { isConfirmed: true };
    });

    const error = { response: { status: 401 } };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("auth_user_name");
    expect(sessionStorage.removeItem).toHaveBeenCalledWith("auth_token");
    expect(sessionStorage.removeItem).toHaveBeenCalledWith("auth_user_name");
    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(Swal.getContainer).toHaveBeenCalled();
    expect(container.style.zIndex).toBe("999999");
    expect(window.location.href).toBe("/login");
  });
});
