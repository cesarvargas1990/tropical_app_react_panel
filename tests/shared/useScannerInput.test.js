import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScannerInput } from "../../src/shared/hooks/useScannerInput";

describe("useScannerInput", () => {
  let onSubmitMock;

  beforeEach(() => {
    onSubmitMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa con valores por defecto", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    expect(result.current.scannerValue).toBe("");
    expect(result.current.scannerFocused).toBe(false);
    expect(result.current.appActive).toBe(true);
    expect(result.current.scannerInputRef.current).toBeNull();
  });

  it("actualiza scannerValue al cambiar", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    const event = { target: { value: "12345" } };

    act(() => {
      result.current.handleScannerChange(event);
    });

    expect(result.current.scannerValue).toBe("12345");
  });

  it("llama onSubmit cuando hay salto de línea en el valor", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    const event = { target: { value: "12345\n" } };

    act(() => {
      result.current.handleScannerChange(event);
    });

    expect(onSubmitMock).toHaveBeenCalledWith("12345");
    expect(result.current.scannerValue).toBe("");
  });

  it("maneja onKeyDown con Enter", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    act(() => {
      result.current.handleScannerChange({ target: { value: "99999" } });
    });

    const event = {
      key: "Enter",
      currentTarget: { value: "99999" },
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleScannerKeyDown(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalledWith("99999");
  });

  it("no hace nada si el valor es vacío", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    const event = {
      key: "Enter",
      currentTarget: { value: "   " },
      preventDefault: vi.fn(),
    };

    act(() => {
      result.current.handleScannerKeyDown(event);
    });

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it("actualiza scannerFocused al hacer focus", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    act(() => {
      result.current.handleScannerFocus();
    });

    expect(result.current.scannerFocused).toBe(true);
  });

  it("actualiza scannerFocused a false al hacer blur", () => {
    const { result } = renderHook(() =>
      useScannerInput({ onSubmit: onSubmitMock }),
    );

    act(() => {
      result.current.handleScannerFocus();
    });

    expect(result.current.scannerFocused).toBe(true);

    act(() => {
      result.current.handleScannerBlur();
    });

    expect(result.current.scannerFocused).toBe(false);
  });
});
