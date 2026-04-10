import React from "react";

export function AppHeaderTitle() {
  const userName =
    typeof window !== "undefined"
      ? window.localStorage.getItem("auth_user_name") ?? ""
      : "";
  const versionLabel = userName
    ? `v ${import.meta.env.VITE_APP_VERSION} (${userName})`
    : `v ${import.meta.env.VITE_APP_VERSION}`;

  return (
    <div className="top-title-block">
      <div className="top-title">Panel de Ventas Insomnia APP</div>
      <div className="top-title-version">{versionLabel}</div>
    </div>
  );
}
