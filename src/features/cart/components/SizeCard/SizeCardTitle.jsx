import React from "react";
import PropTypes from "prop-types";

const formatUnitPrice = (value) => {
  const amount = Number(value || 0);
  return `$${new Intl.NumberFormat("es-CO").format(amount)}`;
};

export const SizeCardTitle = ({ sizeName, unitPrice }) => (
  <div className="size-title">
    Tamaño: {sizeName} ({formatUnitPrice(unitPrice)})
  </div>
);

SizeCardTitle.propTypes = {
  sizeName: PropTypes.string.isRequired,
  unitPrice: PropTypes.number.isRequired,
};
