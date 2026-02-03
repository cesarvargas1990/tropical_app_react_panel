import React from "react"
import { ScannerIcon } from "./Icons"

export function AppHeaderScannerPanel({ scannerProps }) {
  if (!scannerProps) return null

  const isFocused = scannerProps.appActive && scannerProps.scannerFocused
  const panelClassName = `scanner-panel scanner-panel-top ${
    isFocused ? "scanner-panel-focused" : "scanner-panel-blur"
  }`

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      scannerProps.onFocusClick()
    }
  }

  return (
    <div
      className={panelClassName}
      onClick={scannerProps.onFocusClick}
      onTouchStart={scannerProps.onFocusClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-pressed={scannerProps.scannerFocused}
    >
      <span className="scanner-label">
        <span className="scanner-icon" aria-hidden="true">
          <ScannerIcon />
        </span>
      </span>
      <input
        ref={scannerProps.scannerInputRef}
        className="input scanner-input"
        type="tel"
        value={scannerProps.scannerValue}
        onChange={scannerProps.onChange}
        onKeyDown={scannerProps.onKeyDown}
        onBlur={scannerProps.onBlur}
        onFocus={scannerProps.onFocus}
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
