import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ScannerPanel } from "../../src/shared/components/ScannerPanel"

describe("ScannerPanel", () => {
  it("renderiza y dispara focus cuando se hace click", () => {
    const onFocusClick = vi.fn()
    const onChange = vi.fn()
    const onKeyDown = vi.fn()
    const onBlur = vi.fn()
    const onFocus = vi.fn()
    const inputRef = React.createRef()

    render(
      <ScannerPanel
        appActive={true}
        scannerFocused={true}
        scannerValue="123"
        scannerInputRef={inputRef}
        onFocusClick={onFocusClick}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    )

    const button = screen.getByRole("button")
    expect(button.className).toContain("scanner-panel-focused")

    fireEvent.click(button)
    expect(onFocusClick).toHaveBeenCalledTimes(1)

    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("123")
  })
})
