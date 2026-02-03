import React from "react"
import { AppHeaderIcons } from "./AppHeaderIcons"
import { AppHeaderScannerPanel } from "./AppHeaderScannerPanel"
import { AppHeaderTitle } from "./AppHeaderTitle"

/**
 * Componente del header de la aplicación
 */
export function AppHeader({
  scannerProps,
  cartCount,
  onRecentClick,
  onCartClick,
}) {
  return (
    <header className="top-bar">
      <AppHeaderTitle />

      <div className="top-icons">
        <AppHeaderScannerPanel scannerProps={scannerProps} />
        <AppHeaderIcons
          cartCount={cartCount}
          onRecentClick={onRecentClick}
          onCartClick={onCartClick}
        />
      </div>
    </header>
  )
}
