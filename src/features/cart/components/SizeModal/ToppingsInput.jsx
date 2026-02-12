import React from "react";
import PropTypes from "prop-types";

export const ToppingsInput = ({ field, value, activeField, onOpenKeypad }) => {
  const isActive =
    activeField &&
    activeField.type === field.type &&
    activeField.sizeId === field.sizeId &&
    activeField.index === field.index;

  const testId =
    field.type === "global"
      ? `toppings-global-${field.sizeId}`
      : `toppings-row-${field.sizeId}-${field.index}`;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenKeypad(field);
    }
  };

  return (
    <button
      className={`input ${isActive ? "input-active" : ""}`}
      data-testid={testId}
      type="button"
      onClick={() => onOpenKeypad(field)}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
    >
      {value}
    </button>
  );
};

ToppingsInput.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  activeField: PropTypes.object,
  onOpenKeypad: PropTypes.func.isRequired,
};
