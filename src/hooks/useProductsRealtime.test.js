import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useProductsRealtime } from "./useProductsRealtime"

describe("useProductsRealtime", () => {
  let listenMock
  let stopListeningMock
  let channelMock
  let onReload

  beforeEach(() => {
    listenMock = vi.fn()
    stopListeningMock = vi.fn()

    channelMock = {
      listen: listenMock,
      stopListening: stopListeningMock,
    }

    // Mock global Echo
    window.Echo = {
      channel: vi.fn(() => channelMock),
    }

    onReload = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("se conecta al canal y escucha el evento", () => {
    renderHook(() => useProductsRealtime({ onReload }))

    expect(window.Echo.channel).toHaveBeenCalledWith("new-public-channel")
    expect(listenMock).toHaveBeenCalledWith(
      "NewEvent",
      expect.any(Function)
    )
  })

  it("ejecuta onReload cuando llega el evento", () => {
    renderHook(() => useProductsRealtime({ onReload }))

    // obtener callback pasado a listen
    const callback = listenMock.mock.calls[0][1]

    callback({ foo: "bar" })

    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it("no rompe si onReload es undefined", () => {
    renderHook(() => useProductsRealtime())

    const callback = listenMock.mock.calls[0][1]

    expect(() => callback({})).not.toThrow()
  })

  it("limpia el listener al desmontar", () => {
    const { unmount } = renderHook(() =>
      useProductsRealtime(onReload)
    )

    unmount()

    expect(stopListeningMock).toHaveBeenCalledWith("NewEvent")
  })
})
