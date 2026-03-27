import React from "react";
import PropTypes from "prop-types";
import { AppHeaderIcons } from "./AppHeaderIcons";
import { AppHeaderScannerPanel } from "./AppHeaderScannerPanel";
import { AppHeaderTitle } from "./AppHeaderTitle";

/**
 * Componente del header de la aplicación
 */
export function AppHeader({
  scannerProps,
  cartCount,
  onRecentClick,
  onCartClick,
  onSearchClick,
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
          onSearchClick={onSearchClick}
        />
      </div>
    </header>
  );
}

AppHeader.propTypes = {
  scannerProps: PropTypes.object.isRequired,
  cartCount: PropTypes.number.isRequired,
  onRecentClick: PropTypes.func.isRequired,
  onCartClick: PropTypes.func.isRequired,
  onSearchClick: PropTypes.func.isRequired,
};
