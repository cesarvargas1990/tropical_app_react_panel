import React from "react"
import PropTypes from "prop-types"

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

AppHeaderIconButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  showBadge: PropTypes.bool,
  badge: PropTypes.node,
}
