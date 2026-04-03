import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("deviceId service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the configured device id from env", async () => {
    vi.stubEnv("VITE_DEVICE_ID", "tablet-fixed");

    const { getDeviceId } = await import("../../src/shared/services/deviceId");

    expect(getDeviceId()).toBe("tablet-fixed");
  });

  it("reuses the stored device id from localStorage", async () => {
    window.localStorage.setItem("tropical_device_id", "tablet-existing");

    const { getDeviceId } = await import("../../src/shared/services/deviceId");

    expect(getDeviceId()).toBe("tablet-existing");
  });

  it("creates and stores a new id when none exists", async () => {
    const randomUuid = vi.fn(() => "uuid-1234");
    Object.defineProperty(globalThis, "crypto", {
      value: { randomUUID: randomUuid },
      configurable: true,
    });

    const { getDeviceId } = await import("../../src/shared/services/deviceId");

    expect(getDeviceId()).toBe("tablet-uuid-1234");
    expect(randomUuid).toHaveBeenCalled();
    expect(window.localStorage.getItem("tropical_device_id")).toBe(
      "tablet-uuid-1234",
    );
  });

  it("falls back to a generated uuid when crypto.randomUUID is unavailable", async () => {
    const getRandomValues = vi.fn((buffer) => {
      buffer.set([
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22, 0x33, 0x44,
        0x55, 0x66, 0x77, 0x88,
      ]);
      return buffer;
    });

    Object.defineProperty(globalThis, "crypto", {
      value: { getRandomValues },
      configurable: true,
    });

    const { createMutationId } =
      await import("../../src/shared/services/deviceId");

    expect(createMutationId()).toBe("12345678-9abc-4ef0-9122-334455667788");
    expect(getRandomValues).toHaveBeenCalledOnce();
  });
});
