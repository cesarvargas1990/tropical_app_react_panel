import React from "react";
import PropTypes from "prop-types";
import { AppHeaderIconButton } from "./AppHeaderIconButton";
import { ClockIcon, CartIcon } from "./Icons";

export function AppHeaderIcons({ cartCount, onRecentClick, onCartClick }) {
  return (
    <div className="top-icons">
      <AppHeaderIconButton onClick={onRecentClick}>
        <ClockIcon />
      </AppHeaderIconButton>

      <AppHeaderIconButton
        onClick={onCartClick}
        showBadge={cartCount > 0}
        badge={
          cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null
        }
      >
        <CartIcon />
      </AppHeaderIconButton>
    </div>
  );
}

AppHeaderIcons.propTypes = {
  cartCount: PropTypes.number.isRequired,
  onRecentClick: PropTypes.func.isRequired,
  onCartClick: PropTypes.func.isRequired,
};
