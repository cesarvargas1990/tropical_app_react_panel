import React from "react";

export function AppHeaderTitle() {
  return (
    <div className="top-title-block">
      <div className="top-title">Panel de Ventas Insomnia APP</div>
      <div className="top-title-version">
        v {import.meta.env.VITE_APP_VERSION}
      </div>
    </div>
  );
}
