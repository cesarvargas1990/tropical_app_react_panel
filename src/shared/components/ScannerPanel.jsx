import React from "react"

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
    <div
      className={`scanner-panel scanner-panel-top ${
        appActive && scannerFocused
          ? "scanner-panel-focused"
          : "scanner-panel-blur"
      }`}
      onClick={onFocusClick}
      onTouchStart={onFocusClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onFocusClick()
        }
      }}
      aria-pressed={scannerFocused}
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
    </div>
  )
}
