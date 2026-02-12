import React from "react";
import PropTypes from "prop-types";

export const SubtotalRow = ({ subtotal, formatMoney }) => (
  <div
    className="size-row subtotal"
    style={{ fontSize: "22px", marginTop: "10px" }}
  >
    <span>Subtotal:</span>
    <span>{formatMoney(subtotal)}</span>
  </div>
);

SubtotalRow.propTypes = {
  subtotal: PropTypes.number.isRequired,
  formatMoney: PropTypes.func.isRequired,
};
