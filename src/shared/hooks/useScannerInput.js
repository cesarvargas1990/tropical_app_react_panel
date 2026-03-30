import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook para manejar el input del scanner de códigos de barras
 */
export function useScannerInput({ onSubmit }) {
  const [scannerValue, setScannerValue] = useState("");
  const [scannerFocused, setScannerFocused] = useState(false);
  const [appActive, setAppActive] = useState(true);
  const scannerInputRef = useRef(null);
  const preventSoftKeyboard =
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

  const focusScannerInput = useCallback(() => {
    const el = scannerInputRef.current;
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
      const len = el.value?.length ?? 0;
      el.setSelectionRange?.(len, len);
      setScannerFocused(true);
    } catch {
      // ignore focus errors
    }
  }, []);

  const forceScannerFocus = useCallback(() => {
    globalThis.requestAnimationFrame(() => {
      focusScannerInput();
    });
  }, [focusScannerInput]);

  const handleScannerSubmit = useCallback(
    (valueRaw) => {
      const value = String(valueRaw || "").trim();
      if (!value) return;
      onSubmit?.(value);
      setScannerValue("");
      focusScannerInput();
    },
    [onSubmit, focusScannerInput],
  );

  const handleScannerKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleScannerSubmit(scannerValue || event.currentTarget.value);
        return;
      }

      if (!preventSoftKeyboard) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        setScannerValue((prev) => prev.slice(0, -1));
        return;
      }

      const isPrintableKey =
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;

      if (!isPrintableKey) return;

      event.preventDefault();
      setScannerValue((prev) => `${prev}${event.key}`);
    },
    [handleScannerSubmit, preventSoftKeyboard, scannerValue],
  );

  const handleScannerChange = useCallback(
    (event) => {
      const next = event.target.value;
      if (next.includes("\n") || next.includes("\r")) {
        handleScannerSubmit(next);
        return;
      }
      setScannerValue(next);
    },
    [handleScannerSubmit],
  );

  const handleScannerBlur = useCallback(() => {
    setScannerFocused(false);
    globalThis.setTimeout(() => {
      forceScannerFocus();
    }, 0);
  }, [forceScannerFocus]);

  const handleScannerFocus = useCallback(() => {
    setScannerFocused(true);
  }, []);

  // Manejo de visibilidad y focus de la app
  useEffect(() => {
    forceScannerFocus();
    const handleVisibility = () => {
      const active = !document.hidden;
      setAppActive(active);
      if (active) {
        forceScannerFocus();
      } else {
        setScannerFocused(false);
      }
    };
    const handleWindowBlur = () => {
      setAppActive(false);
      setScannerFocused(false);
    };
    const handleWindowFocus = () => {
      setAppActive(true);
      forceScannerFocus();
    };
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [forceScannerFocus]);

  return {
    scannerValue,
    scannerFocused,
    appActive,
    preventSoftKeyboard,
    scannerInputRef,
    focusScannerInput,
    forceScannerFocus,
    handleScannerKeyDown,
    handleScannerChange,
    handleScannerBlur,
    handleScannerFocus,
  };
}
