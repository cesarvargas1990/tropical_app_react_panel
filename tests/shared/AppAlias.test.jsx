import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "../../src/components/App";

vi.mock("../../src/shared/components/App", () => ({
  default: () => <div data-testid="shared-app">shared app</div>,
}));

describe("App alias", () => {
  it("reexports the shared App component", () => {
    render(<App />);

    expect(screen.getByTestId("shared-app")).toHaveTextContent("shared app");
  });
});
