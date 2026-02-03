import React from "react"

export function AppHeaderIconButton({ onClick, children, showBadge, badge }) {
  return (
    <button
      className="icon-button"
      onClick={onClick}
      style={showBadge ? { position: "relative" } : undefined}
    >
      {children}
      {showBadge && badge}
    </button>
  )
}
