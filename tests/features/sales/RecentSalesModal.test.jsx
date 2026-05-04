import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { RecentSalesModal } from "../../../src/features/sales/components/RecentSalesModal";
import { getLatestSales } from "../../../src/features/sales/services/salesService";
import { getSalesEventName } from "../../../src/features/sales/services/offlineSalesStore";

vi.mock("../../../src/features/sales/services/salesService", () => ({
  getLatestSales: vi.fn(),
}));

vi.mock("../../../src/features/sales/services/offlineSalesStore", () => ({
  getSalesEventName: vi.fn(() => "tropical-offline-sales-updated"),
}));

describe("RecentSalesModal", () => {
  const sampleSales = [
    {
      id: 1,
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
    expect(getSalesEventName).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText("Máquina")).not.toBeInTheDocument();
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

  it("marca en pantalla las ventas pendientes por sincronizar", async () => {
    getLatestSales.mockResolvedValue([
      {
        id: "pending-1",
        machine: "A3",
        flavor: "Fresa",
        feature: "",
        size: "M",
        quantity: 1,
        date: "13/04/2026 08:20 AM",
        __unsynced: true,
      },
    ]);

    render(<RecentSalesModal onClose={vi.fn()} />);

    const pendingText = await screen.findByText(/Pendiente/i);
    expect(pendingText).toBeInTheDocument();
    expect(pendingText.closest("tr")).toHaveClass("recent-row-pending");
  });

  it("marca en verde una venta offline ya sincronizada", async () => {
    getLatestSales.mockResolvedValue([
      {
        id: 22,
        machine: "A4",
        flavor: "Limon",
        feature: "",
        size: "L",
        quantity: 1,
        date: "13/04/2026 08:20 AM",
        __offline: true,
        __unsynced: false,
      },
    ]);

    render(<RecentSalesModal onClose={vi.fn()} />);

    const offlineText = await screen.findByText(/Offline/i);
    expect(offlineText).toBeInTheDocument();
    expect(offlineText.closest("tr")).toHaveClass("recent-row-offline-synced");
  });

  it("orders sales by the real timestamp descending", async () => {
    getLatestSales.mockResolvedValue([
      {
        id: 1,
        machine: "Tanque 1",
        flavor: "Refrescante",
        feature: "Refrescante",
        size: "M",
        quantity: 1,
        date: "14/04/2026 04:59 PM",
        fecha_hora: "2026-04-14 16:59:01",
      },
      {
        id: 2,
        machine: "Tanque 1",
        flavor: "Refrescante",
        feature: "Refrescante",
        size: "L",
        quantity: 1,
        date: "14/04/2026 04:59 PM",
        fecha_hora: "2026-04-14 16:59:59",
      },
    ]);

    render(<RecentSalesModal onClose={vi.fn()} />);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows[1]).toHaveTextContent("L");
      expect(rows[2]).toHaveTextContent("M");
    });
  });
});
