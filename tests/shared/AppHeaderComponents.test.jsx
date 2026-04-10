import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { AppHeader } from "../../src/shared/components/AppHeader";
import { AppHeaderTitle } from "../../src/shared/components/AppHeaderTitle";
import { AppHeaderIconButton } from "../../src/shared/components/AppHeaderIconButton";
import { AppHeaderIcons } from "../../src/shared/components/AppHeaderIcons";
import { AppHeaderScannerPanel } from "../../src/shared/components/AppHeaderScannerPanel";

describe("App header components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_APP_VERSION", "9.9.9");
    localStorage.clear();
  });

  it("renders AppHeaderTitle with configured version", () => {
    render(<AppHeaderTitle />);

    expect(
      screen.getByText("Panel de Ventas Insomnia APP"),
    ).toBeInTheDocument();
    expect(screen.getByText("v 9.9.9")).toBeInTheDocument();
  });

  it("renders AppHeaderTitle with logged user next to version", () => {
    localStorage.setItem("auth_user_name", "Cesar");

    render(<AppHeaderTitle />);

    expect(screen.getByText("v 9.9.9 (Cesar)")).toBeInTheDocument();
  });

  it("renders AppHeaderIconButton badge only when requested", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <AppHeaderIconButton onClick={onClick}>
        <span>child</span>
      </AppHeaderIconButton>,
    );

    const button = screen.getByRole("button");
    expect(button).not.toHaveStyle({ position: "relative" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <AppHeaderIconButton
        onClick={onClick}
        showBadge
        badge={<span data-testid="badge">2</span>}
      >
        <span>child</span>
      </AppHeaderIconButton>,
    );

    expect(screen.getByTestId("badge")).toHaveTextContent("2");
    expect(screen.getByRole("button")).toHaveStyle({ position: "relative" });
  });

  it("renders AppHeaderIcons and delegates clicks", () => {
    const onSearchClick = vi.fn();
    const onRecentClick = vi.fn();
    const onCartClick = vi.fn();

    render(
      <AppHeaderIcons
        cartCount={3}
        onSearchClick={onSearchClick}
        onRecentClick={onRecentClick}
        onCartClick={onCartClick}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(screen.getByText("3")).toHaveClass("cart-badge");

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(onSearchClick).toHaveBeenCalledTimes(1);
    expect(onRecentClick).toHaveBeenCalledTimes(1);
    expect(onCartClick).toHaveBeenCalledTimes(1);
  });

  it("does not render cart badge when cartCount is zero", () => {
    render(
      <AppHeaderIcons
        cartCount={0}
        onSearchClick={vi.fn()}
        onRecentClick={vi.fn()}
        onCartClick={vi.fn()}
      />,
    );

    expect(screen.queryByText("0")).toBeNull();
  });

  it("returns null in AppHeaderScannerPanel without scannerProps", () => {
    const { container } = render(<AppHeaderScannerPanel scannerProps={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders AppHeaderScannerPanel and triggers focus on click and keyboard", () => {
    const onFocusClick = vi.fn();
    const scannerProps = {
      appActive: true,
      scannerFocused: true,
      preventSoftKeyboard: false,
      onFocusClick,
      scannerInputRef: { current: null },
      scannerValue: "123",
      onChange: vi.fn(),
      onKeyDown: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
    };

    render(<AppHeaderScannerPanel scannerProps={scannerProps} />);

    const panelButton = screen.getByRole("button", { pressed: true });
    expect(panelButton).toHaveClass("scanner-panel-focused");

    fireEvent.click(panelButton);
    fireEvent.touchStart(panelButton);
    fireEvent.keyDown(panelButton, { key: "Enter" });
    fireEvent.keyDown(panelButton, { key: " " });
    fireEvent.keyDown(panelButton, { key: "Escape" });

    expect(onFocusClick).toHaveBeenCalledTimes(4);
    expect(screen.getByDisplayValue("123")).toBeInTheDocument();
  });

  it("renders AppHeader and wires scanner plus icon actions", () => {
    const onSearchClick = vi.fn();
    const onRecentClick = vi.fn();
    const onCartClick = vi.fn();
    const scannerProps = {
      appActive: false,
      scannerFocused: false,
      preventSoftKeyboard: true,
      onFocusClick: vi.fn(),
      scannerInputRef: { current: null },
      scannerValue: "",
      onChange: vi.fn(),
      onKeyDown: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
    };

    render(
      <AppHeader
        scannerProps={scannerProps}
        cartCount={1}
        onSearchClick={onSearchClick}
        onRecentClick={onRecentClick}
        onCartClick={onCartClick}
      />,
    );

    expect(
      screen.getByText("Panel de Ventas Insomnia APP"),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toHaveClass("cart-badge");

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);
    fireEvent.click(buttons[3]);

    expect(onSearchClick).toHaveBeenCalledTimes(1);
    expect(onRecentClick).toHaveBeenCalledTimes(1);
    expect(onCartClick).toHaveBeenCalledTimes(1);
  });
});
