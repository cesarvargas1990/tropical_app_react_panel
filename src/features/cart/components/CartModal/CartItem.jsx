import React from "react";
import PropTypes from "prop-types";
import { CartItemDetails } from "./CartItemDetails";
import { formatMoney } from "./utils";
import { EditIcon, TrashIcon } from "./Icons";
import { ICON_BUTTON_STYLE } from "./constants";

export const CartItem = ({ item, index, isRegistering, onEditItem }) => {
  const handleEdit = () => {
    if (!isRegistering) {
      onEditItem(item, index);
    }
  };

  const handleRemove = () => {
    if (!isRegistering) {
      item.onRemove(index);
    }
  };

  const iconButtonStyle = {
    ...ICON_BUTTON_STYLE,
    cursor: isRegistering ? "not-allowed" : "pointer",
    opacity: isRegistering ? 0.6 : 1,
  };

  return (
    <div className="cart-item">
      <button
        onClick={handleEdit}
        className="icon-circle"
        aria-label="Editar item"
        disabled={isRegistering}
        style={{
          ...iconButtonStyle,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.20)",
        }}
      >
        <EditIcon />
      </button>

      <button
        onClick={handleEdit}
        className="cart-item-main"
        disabled={isRegistering}
        type="button"
        style={{
          cursor: isRegistering ? "not-allowed" : "pointer",
          opacity: isRegistering ? 0.7 : 1,
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          flex: 1,
        }}
      >
        <div className="cart-item-title">
          {item.productName} ({item.sizeLabel})
        </div>
        <CartItemDetails item={item} />
      </button>

      <div className="cart-item-side">
        <div className="cart-item-subtotal-big">
          {formatMoney(item.subtotal)}
        </div>
        <button
          onClick={handleRemove}
          className="icon-circle"
          aria-label="Eliminar item"
          disabled={isRegistering}
          style={{
            ...iconButtonStyle,
            background: "#C62828",
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    sizeLabel: PropTypes.string.isRequired,
    subtotal: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  isRegistering: PropTypes.bool.isRequired,
  onEditItem: PropTypes.func.isRequired,
};
