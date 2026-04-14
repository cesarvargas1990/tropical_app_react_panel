import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getLatestSales } from "../services/salesService";
import { getSalesEventName } from "../services/offlineSalesStore";

function parseSaleDate(value) {
  if (!value) {
    return 0;
  }

  const nativeValue = Date.parse(String(value));
  if (!Number.isNaN(nativeValue)) {
    return nativeValue;
  }

  const match = String(value)
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)$/i);

  if (!match) {
    return 0;
  }

  const [, day, month, year, hourRaw, minute, dayPeriod] = match;
  let hour = Number(hourRaw);

  if (dayPeriod.toUpperCase() === "PM" && hour < 12) {
    hour += 12;
  }

  if (dayPeriod.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour,
    Number(minute),
  );
}

function sortSalesDesc(rows) {
  return [...rows].sort((left, right) => {
    const rightTime = parseSaleDate(
      right?.fecha_hora ?? right?.__sortDate ?? right?.date,
    );
    const leftTime = parseSaleDate(
      left?.fecha_hora ?? left?.__sortDate ?? left?.date,
    );

    return rightTime - leftTime;
  });
}

export function RecentSalesModal({ onClose }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadSales = () => {
      getLatestSales()
        .then((data) => {
          if (mounted) {
            setSales(sortSalesDesc(Array.isArray(data) ? data : []));
          }
        })
        .catch((err) => console.error("Error cargando ventas:", err));
    };

    loadSales();

    const salesEventName = getSalesEventName();
    window.addEventListener("online", loadSales);
    window.addEventListener(salesEventName, loadSales);

    return () => {
      mounted = false;
      window.removeEventListener("online", loadSales);
      window.removeEventListener(salesEventName, loadSales);
    };
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="recent-modal">
        <div className="recent-header">
          <h2>Últimas ventas registradas</h2>
        </div>

        <div className="recent-table-wrapper">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Máquina</th>
                <th>Sabor</th>
                <th>Característica</th>
                <th>Tamaño</th>
                <th>Cantidad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className={
                    sale.__unsynced
                      ? "recent-row-pending"
                      : sale.__offline
                        ? "recent-row-offline-synced"
                        : undefined
                  }
                >
                  <td>{sale.machine}</td>
                  <td>{sale.flavor}</td>
                  <td>{sale.feature}</td>
                  <td>{sale.size}</td>
                  <td className="recent-link">{sale.quantity}</td>
                  <td>
                    {sale.date}
                    {sale.__unsynced
                      ? " • Pendiente"
                      : sale.__offline
                        ? " • Offline"
                        : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="recent-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

RecentSalesModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
