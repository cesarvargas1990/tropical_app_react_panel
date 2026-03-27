import React from "react";
import PropTypes from "prop-types";
import { AppHeaderIconButton } from "./AppHeaderIconButton";
import { ClockIcon, CartIcon, SearchIcon } from "./Icons";

export function AppHeaderIcons({
  cartCount,
  onRecentClick,
  onCartClick,
  onSearchClick,
}) {
  return (
    <div className="top-icons">
      <AppHeaderIconButton onClick={onSearchClick}>
        <SearchIcon />
      </AppHeaderIconButton>

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
  onSearchClick: PropTypes.func.isRequired,
};
