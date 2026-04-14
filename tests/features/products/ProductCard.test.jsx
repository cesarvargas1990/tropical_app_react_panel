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

  it("renders the cart badge when the product has units in cart", () => {
    render(<ProductCard product={product} badgeCount={3} onSelect={vi.fn()} />);

    expect(screen.getByLabelText("3 en carrito")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders variant badges when the product has multiple sizes in cart", () => {
    render(
      <ProductCard
        product={product}
        badgeCount={3}
        variantBadges={[
          { label: "S", count: 1, tone: 0 },
          { label: "M", count: 1, tone: 1 },
          { label: "L", count: 1, tone: 2 },
        ]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByLabelText("3 en carrito")).toBeInTheDocument();
  });
});
