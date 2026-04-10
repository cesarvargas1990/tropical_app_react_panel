import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import api from "../../../src/shared/services/api";
import {
  apiLogin,
  apiValidateToken,
} from "../../../src/features/auth/services/authService";

// Mock de axios COMPLETO (no hace llamadas reales)
vi.mock("axios");
vi.mock("../../../src/shared/services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};
const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
};

describe("authService - apiLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna token y usuario cuando las credenciales son correctas", async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {
        token: "fake-jwt-token",
        user: {
          id: 7,
          name: "Cesar",
        },
      },
    });

    const payload = await apiLogin("test@mail.com", "123456");

    expect(mockedAxios.post).toHaveBeenCalledOnce();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${import.meta.env.VITE_BACKEND_URL}/api/login`,
      {
        email: "test@mail.com",
        password: "123456",
      },
    );

    expect(payload).toEqual({
      token: "fake-jwt-token",
      user: {
        id: 7,
        name: "Cesar",
      },
    });
  });

  it("lanza error si el servidor no devuelve token", async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: {},
    });

    await expect(apiLogin("test@mail.com", "123456")).rejects.toThrow(
      "Credenciales incorrectas",
    );
  });

  it("lanza error si axios falla (credenciales incorrectas)", async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error("401"));

    await expect(apiLogin("test@mail.com", "bad-password")).rejects.toThrow(
      "Credenciales incorrectas",
    );
  });

  it("retorna usuario al validar token", async () => {
    mockedApi.get = vi.fn().mockResolvedValue({
      data: {
        valid: true,
        user: {
          id: 7,
          name: "Cesar",
        },
      },
    });

    await expect(apiValidateToken()).resolves.toEqual({
      valid: true,
      user: {
        id: 7,
        name: "Cesar",
      },
    });

    expect(mockedApi.get).toHaveBeenCalledWith("/api/validate-token");
  });
});
