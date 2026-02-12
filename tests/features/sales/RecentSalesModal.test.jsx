import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { RecentSalesModal } from "../../../src/features/sales/components/RecentSalesModal";
import { getLatestSales } from "../../../src/features/sales/services/salesService";

vi.mock("../../../src/features/sales/services/salesService", () => ({
  getLatestSales: vi.fn(),
}));

describe("RecentSalesModal", () => {
  const sampleSales = [
    {
      id: 1,
      machine: "A1",
      flavor: "Mango",
      feature: "Frozen",
      size: "L",
      quantity: 3,
      date: "2024-08-01",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays the latest sales", async () => {
    getLatestSales.mockResolvedValue(sampleSales);
    const onClose = vi.fn();

    render(<RecentSalesModal onClose={onClose} />);

    expect(getLatestSales).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText("A1")).toBeInTheDocument();
      expect(screen.getByText("Mango")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("logs an error if loading sales fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getLatestSales.mockRejectedValue(new Error("network"));

    render(<RecentSalesModal onClose={vi.fn()} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error cargando ventas:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });
});
