import React from "react";
import PropTypes from "prop-types";

const FILES_URL = import.meta.env.VITE_FILES_URL;

export function ProductCard({
  product,
  badgeCount = 0,
  variantBadges = [],
  onSelect,
}) {
  return (
    <button
      className="product-card"
      onClick={() => onSelect(product)}
      type="button"
      aria-label={`Seleccionar ${product.name}`}
    >
      {variantBadges.length > 0 ? (
        <div className="product-card-badges" aria-label={`${badgeCount} en carrito`}>
          {variantBadges.map((badge) => (
            <span
              key={`${badge.label}-${badge.tone}`}
              className={`product-card-badge product-card-badge-tone-${badge.tone}`}
            >
              <span className="product-card-badge-label">{badge.label}</span>
              <span className="product-card-badge-count">{badge.count}</span>
            </span>
          ))}
        </div>
      ) : badgeCount > 0 ? (
        <span className="product-card-badge" aria-label={`${badgeCount} en carrito`}>
          {badgeCount}
        </span>
      ) : null}

      <div className="product-image-wrapper">
        <img
          src={`${FILES_URL}/${product.imageUrl}`}
          alt={product.name}
          className="product-image"
        />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-description">{product.caracteristica}</div>
      </div>
    </button>
  );
}

ProductCard.propTypes = {
  badgeCount: PropTypes.number,
  product: PropTypes.shape({
    imageUrl: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    caracteristica: PropTypes.string.isRequired,
  }).isRequired,
  variantBadges: PropTypes.arrayOf(
    PropTypes.shape({
      count: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      tone: PropTypes.number.isRequired,
    }),
  ),
  onSelect: PropTypes.func.isRequired,
};
