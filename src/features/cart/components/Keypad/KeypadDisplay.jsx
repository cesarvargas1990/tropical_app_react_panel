import React from "react";
import PropTypes from "prop-types";

export const KeypadDisplay = ({ value }) => (
  <div className="keypad-display">{value}</div>
);

KeypadDisplay.propTypes = {
  value: PropTypes.string.isRequired,
};
