import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProductsRealtime } from "../../../src/features/products/hooks/useProductsRealtime";

describe("useProductsRealtime", () => {
  let listenMock;
  let stopListeningMock;
  let channelMock;
  let onReload;
  let onLegacyProductEvent;
  let onCartUpdated;

  beforeEach(() => {
    listenMock = vi.fn();
    stopListeningMock = vi.fn();

    channelMock = {
      listen: listenMock,
      stopListening: stopListeningMock,
    };

    // Mock global Echo
    window.Echo = {
      channel: vi.fn(() => channelMock),
    };

    onReload = vi.fn();
    onLegacyProductEvent = vi.fn();
    onCartUpdated = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("se conecta al canal y escucha el evento", () => {
    renderHook(() =>
      useProductsRealtime({ onReload, onLegacyProductEvent, onCartUpdated }),
    );

    expect(window.Echo.channel).toHaveBeenCalledWith("new-public-channel");
    expect(listenMock).toHaveBeenCalledWith("NewEvent", expect.any(Function));
    expect(listenMock).toHaveBeenCalledWith(
      "CartUpdated",
      expect.any(Function),
    );
  });

  it("ejecuta onReload y delega el evento legacy cuando llega NewEvent", () => {
    renderHook(() =>
      useProductsRealtime({ onReload, onLegacyProductEvent, onCartUpdated }),
    );

    const callback = listenMock.mock.calls[0][1];

    callback({ message: "productid 77" });

    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onLegacyProductEvent).toHaveBeenCalledWith({
      productId: 77,
      rawEvent: { message: "productid 77" },
    });
  });

  it("delegates CartUpdated events", () => {
    renderHook(() =>
      useProductsRealtime({ onReload, onLegacyProductEvent, onCartUpdated }),
    );

    const callback = listenMock.mock.calls[1][1];
    callback({ version: 2 });

    expect(onCartUpdated).toHaveBeenCalledWith({ version: 2 });
  });

  it("no rompe si onReload es undefined", () => {
    renderHook(() => useProductsRealtime());

    const callback = listenMock.mock.calls[0][1];

    expect(() => callback({})).not.toThrow();
  });

  it("limpia el listener al desmontar", () => {
    const { unmount } = renderHook(() =>
      useProductsRealtime({ onReload, onLegacyProductEvent, onCartUpdated }),
    );

    unmount();

    expect(stopListeningMock).toHaveBeenCalledWith("NewEvent");
    expect(stopListeningMock).toHaveBeenCalledWith("CartUpdated");
  });
});
