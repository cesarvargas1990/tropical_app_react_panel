import { useEffect } from "react";

/**
 * Hook compartido para bloquear el scroll del body cuando hay modales abiertos
 */
export function useBodyLock(isLocked) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isLocked ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [isLocked]);
}
