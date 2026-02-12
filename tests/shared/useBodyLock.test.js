import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useBodyLock } from "../../src/shared/hooks/useBodyLock";

describe("useBodyLock", () => {
  beforeEach(() => {
    // Resetear el overflow antes de cada test
    document.body.style.overflow = "";
  });

  it("bloquea el scroll cuando isLocked es true", () => {
    renderHook(() => useBodyLock(true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restaura el scroll cuando isLocked es false", () => {
    renderHook(() => useBodyLock(false));

    expect(document.body.style.overflow).toBe("auto");
  });

  it("restaura el overflow anterior al desmontar", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = renderHook(() => useBodyLock(true));

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });
});
