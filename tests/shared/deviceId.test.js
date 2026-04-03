import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("deviceId service", () => {
  beforeEach(() => {
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
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
    });
    vi.spyOn(Math, "random").mockReturnValue(0.25);

    const { createMutationId } =
      await import("../../src/shared/services/deviceId");

    expect(createMutationId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
