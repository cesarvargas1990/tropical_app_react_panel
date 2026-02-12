import React from "react";
import PropTypes from "prop-types";
import { IndividualRow } from "./IndividualRow";

export const IndividualRowsList = ({
  items,
  sizeId,
  size,
  renderToppingsDisplay,
  onRowPatch,
  formatMoney,
  getRowSubtotal,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((row, index) => {
        const rowKey = `row-${sizeId}-${index}`;
        const rowSubtotal = getRowSubtotal(size, row);

        return (
          <IndividualRow
            key={rowKey}
            row={row}
            index={index}
            sizeId={sizeId}
            renderToppingsDisplay={renderToppingsDisplay}
            onRowPatch={onRowPatch}
            formatMoney={formatMoney}
            rowSubtotal={rowSubtotal}
          />
        );
      })}
    </>
  );
};

IndividualRowsList.propTypes = {
  items: PropTypes.array,
  sizeId: PropTypes.number.isRequired,
  size: PropTypes.object.isRequired,
  renderToppingsDisplay: PropTypes.func.isRequired,
  onRowPatch: PropTypes.func.isRequired,
  formatMoney: PropTypes.func.isRequired,
  getRowSubtotal: PropTypes.func.isRequired,
};
