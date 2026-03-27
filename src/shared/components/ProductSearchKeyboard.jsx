import React from "react";
import PropTypes from "prop-types";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function ProductSearchKeyboard({
  value,
  open,
  onClose,
  onChange,
  onBackspace,
  onClear,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop keypad-backdrop">
      <button
        type="button"
        className="modal-backdrop-button"
        onClick={onClose}
        aria-label="Cerrar buscador"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "default",
        }}
      />
      <div
        className="modal keypad-modal search-keypad-modal"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="keypad-header">
          <div className="keypad-title">Buscar producto</div>
        </div>

        <div className="keypad-display search-keypad-display">
          {value || "Escribe para filtrar productos"}
        </div>

        <div className="search-keyboard-grid">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={`search-row-${rowIndex}`} className="search-keyboard-row">
              {row.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className="btn-primary search-key-btn"
                  onClick={() => onChange(`${value}${letter}`)}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}

          <div className="search-keyboard-row">
            <button
              type="button"
              className="btn-secondary search-key-btn search-key-btn-wide"
              onClick={onClear}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="btn-primary search-key-btn search-key-btn-space"
              onClick={() => onChange(`${value} `)}
            >
              Espacio
            </button>
            <button
              type="button"
              className="btn-secondary search-key-btn search-key-btn-wide"
              onClick={onBackspace}
            >
              Borrar
            </button>
          </div>
        </div>

        <div className="keypad-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

ProductSearchKeyboard.propTypes = {
  value: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onBackspace: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
