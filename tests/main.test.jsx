import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("main entry", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("creates a React root and renders App within StrictMode", async () => {
    const renderMock = vi.fn();
    const createRootMock = vi.fn(() => ({
      render: renderMock,
    }));

    vi.doMock("react-dom/client", () => ({
      default: {
        createRoot: createRootMock,
      },
    }));

    const MockApp = () => React.createElement("div", null, "Mocked App");
    vi.doMock("../src/shared/components/App", () => ({
      default: MockApp,
    }));

    await import("../src/main.jsx");

    const rootElement = document.getElementById("root");
    expect(createRootMock).toHaveBeenCalledWith(rootElement);
    expect(renderMock).toHaveBeenCalledTimes(1);

    const renderedTree = renderMock.mock.calls[0][0];
    expect(renderedTree.type).toBe(React.StrictMode);
    expect(renderedTree.props.children).toEqual(<MockApp />);
  });
});
