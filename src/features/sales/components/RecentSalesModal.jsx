import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getLatestSales } from "../services/salesService";

export function RecentSalesModal({ onClose }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    getLatestSales()
      .then((data) => setSales(data))
      .catch((err) => console.error("Error cargando ventas:", err));
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
                <tr key={sale.id}>
                  <td>{sale.machine}</td>
                  <td>{sale.flavor}</td>
                  <td>{sale.feature}</td>
                  <td>{sale.size}</td>
                  <td className="recent-link">{sale.quantity}</td>
                  <td>{sale.date}</td>
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
