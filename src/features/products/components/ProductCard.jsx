import React from 'react'


const FILES_URL = import.meta.env.VITE_FILES_URL

export function ProductCard({ product, onSelect }) {
  return (
    <div className="product-card" onClick={() => onSelect(product)}>
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
    </div>
  )
}
