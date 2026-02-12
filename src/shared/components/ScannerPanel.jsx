import React from "react";
import PropTypes from "prop-types";

/**
 * Componente del panel de scanner en el header
 */
export function ScannerPanel({
  appActive,
  scannerFocused,
  scannerValue,
  scannerInputRef,
  onFocusClick,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
}) {
  return (
    <button
      className={`scanner-panel scanner-panel-top ${
        appActive && scannerFocused
          ? "scanner-panel-focused"
          : "scanner-panel-blur"
      }`}
      onClick={onFocusClick}
      onTouchStart={onFocusClick}
      aria-pressed={scannerFocused}
      type="button"
    >
      <span className="scanner-label">
        <span className="scanner-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 7V5a1 1 0 0 1 1-1h2" />
            <path d="M4 17v2a1 1 0 0 0 1 1h2" />
            <path d="M20 7V5a1 1 0 0 0-1-1h-2" />
            <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
            <path d="M8 6v12" />
            <path d="M12 6v12" />
            <path d="M16 6v12" />
          </svg>
        </span>
      </span>
      <input
        ref={scannerInputRef}
        className="input scanner-input"
        type="tel"
        value={scannerValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="none"
        pattern="[0-9]*"
        enterKeyHint="done"
        name="scanner"
      />
    </button>
  );
}

ScannerPanel.propTypes = {
  appActive: PropTypes.bool.isRequired,
  scannerFocused: PropTypes.bool.isRequired,
  scannerValue: PropTypes.string.isRequired,
  scannerInputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
    .isRequired,
  onFocusClick: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
};
