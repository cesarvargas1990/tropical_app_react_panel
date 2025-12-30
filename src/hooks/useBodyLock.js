import { useEffect } from "react";

// Bloquea el scroll del body mientras haya un modal abierto.
export function useBodyLock(isLocked) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isLocked ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [isLocked]);
}
