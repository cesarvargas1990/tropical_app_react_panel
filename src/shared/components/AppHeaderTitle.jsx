import React from "react";
import PropTypes from "prop-types";

export function AppHeaderTitle({ userName = "" }) {
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

AppHeaderTitle.propTypes = {
  userName: PropTypes.string,
};
