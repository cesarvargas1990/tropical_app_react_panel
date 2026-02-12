import React from "react";
import PropTypes from "prop-types";

const FILES_URL = import.meta.env.VITE_FILES_URL;

export function ProductCard({ product, onSelect }) {
  return (
    <button
      className="product-card"
      onClick={() => onSelect(product)}
      type="button"
      aria-label={`Seleccionar ${product.name}`}
    >
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
  product: PropTypes.shape({
    imageUrl: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    caracteristica: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};
