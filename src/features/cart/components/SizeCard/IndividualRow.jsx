import React from "react";
import PropTypes from "prop-types";

export const IndividualRow = ({
  row,
  index,
  sizeId,
  renderToppingsDisplay,
  onRowPatch,
  formatMoney,
  rowSubtotal,
}) => {
  const showRow = Number(row.toppings || 0) > 0 || row.delivery;

  if (!showRow) return null;

  const handleDeliveryChange = (e) => {
    onRowPatch(sizeId, index, { delivery: e.target.checked });
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <div className="size-row" style={{ fontWeight: "600" }}>
        <span>Toppings:</span>
      </div>

      <div className="size-row">
        {renderToppingsDisplay(
          { type: "row", sizeId, index },
          String(row.toppings || 0),
        )}

        <span style={{ marginLeft: "16px" }}>
          Domicilio:{" "}
          <input
            type="checkbox"
            checked={row.delivery}
            onChange={handleDeliveryChange}
          />
        </span>
      </div>

      <div className="size-row">
        <span>{formatMoney(rowSubtotal)}</span>
      </div>
    </div>
  );
};

IndividualRow.propTypes = {
  row: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  sizeId: PropTypes.number.isRequired,
  renderToppingsDisplay: PropTypes.func.isRequired,
  onRowPatch: PropTypes.func.isRequired,
  formatMoney: PropTypes.func.isRequired,
  rowSubtotal: PropTypes.number.isRequired,
};
