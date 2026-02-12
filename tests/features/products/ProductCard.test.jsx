import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ProductCard } from "../../../src/features/products/components/ProductCard";

describe("ProductCard", () => {
  const product = {
    id: 1,
    name: "Lulada",
    caracteristica: "Refrescante",
    imageUrl: "lulada.png",
  };

  it("renders product info and image using FILES_URL", () => {
    const onSelect = vi.fn();

    render(<ProductCard product={product} onSelect={onSelect} />);

    expect(screen.getByText("Lulada")).toBeInTheDocument();
    expect(screen.getByText("Refrescante")).toBeInTheDocument();

    const image = screen.getByRole("img", { name: /Lulada/i });
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining(product.imageUrl),
    );

    fireEvent.click(screen.getByText("Lulada"));
    expect(onSelect).toHaveBeenCalledWith(product);
  });
});
