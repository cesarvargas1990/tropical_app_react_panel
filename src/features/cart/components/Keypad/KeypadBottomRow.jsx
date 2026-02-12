import React from "react";
import PropTypes from "prop-types";
import { KEYPAD_ACTIONS } from "./constants";

export const KeypadBottomRow = ({ onKeyPress }) => (
  <div className="keypad-row keypad-row-center">
    <button
      type="button"
      className="btn-secondary"
      onClick={() => onKeyPress(KEYPAD_ACTIONS.CLEAR)}
    >
      Limpiar
    </button>
    <button
      type="button"
      className="btn-primary"
      onClick={() => onKeyPress(KEYPAD_ACTIONS.ZERO)}
    >
      {KEYPAD_ACTIONS.ZERO}
    </button>
    <button
      type="button"
      className="btn-secondary"
      onClick={() => onKeyPress(KEYPAD_ACTIONS.BACKSPACE)}
    >
      <span aria-hidden="true">⌫</span> Borrar
    </button>
  </div>
);

KeypadBottomRow.propTypes = {
  onKeyPress: PropTypes.func.isRequired,
};
