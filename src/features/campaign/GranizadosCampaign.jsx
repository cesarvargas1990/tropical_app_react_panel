import React, { useEffect, useMemo, useState } from "react";
import { getGranizadosCampaignTotal } from "./services/granizadosCampaignService";

const POLL_INTERVAL_MS = 5000;

function formatCounter(value) {
  return String(Math.max(0, Number(value) || 0))
    .padStart(7, "0")
    .split("");
}

export default function GranizadosCampaign() {
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [posterSrc, setPosterSrc] = useState("/granizados-ladrillos.webp");
  const digits = useMemo(() => formatCounter(total), [total]);

  useEffect(() => {
    let active = true;
    let timerId;

    async function loadTotal() {
      try {
        const data = await getGranizadosCampaignTotal();

        if (!active) return;

        setTotal(data?.ladrillos_total ?? data?.granizados_total ?? 0);
        setStatus("ready");
      } catch (error) {
        if (!active) return;

        console.error(
          "No se pudo cargar el total publico de granizados:",
          error,
        );
        setStatus("error");
      } finally {
        if (active) {
          timerId = window.setTimeout(loadTotal, POLL_INTERVAL_MS);
        }
      }
    }

    loadTotal();

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, []);

  return (
    <main className="campaign-page">
      <section
        className="campaign-poster"
        aria-label={`${total} granizados vendidos para la campana Insomnia`}
      >
        <img
          className="campaign-poster-image"
          src={posterSrc}
          alt=""
          onError={() => {
            if (posterSrc !== "/tropical/granizados-ladrillos.webp") {
              setPosterSrc("/tropical/granizados-ladrillos.webp");
            }
          }}
        />

        <div className="campaign-counter" data-status={status}>
          {digits.map((digit, index) => (
            <span
              className="campaign-counter-digit"
              key={`${index}-${digit}`}
              aria-hidden="true"
            >
              {digit}
            </span>
          ))}
        </div>

        <div className="campaign-live" aria-live="polite">
          {status === "error"
            ? "Reintentando conexion"
            : "Actualizado en tiempo real"}
        </div>
      </section>
    </main>
  );
}
