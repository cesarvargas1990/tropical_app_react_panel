import React from "react";
import PropTypes from "prop-types";

export const ToppingsSection = ({
  sizeId,
  toppings,
  renderToppingsDisplay,
}) => (
  <>
    <div className="size-row">
      <span>Valor toppings:</span>
    </div>
    <div className="size-row">
      {renderToppingsDisplay({ type: "global", sizeId }, String(toppings || 0))}
    </div>
  </>
);

ToppingsSection.propTypes = {
  sizeId: PropTypes.number.isRequired,
  toppings: PropTypes.number,
  renderToppingsDisplay: PropTypes.func.isRequired,
};
