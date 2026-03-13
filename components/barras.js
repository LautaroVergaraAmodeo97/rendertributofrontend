"use client";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const SITUACION_COLORS = {
  "Situación Normal": "#00e096",
  "Situación con seguimiento especial o riesgo bajo": "#f0b429",
  "Con problemas o riesgo medio": "#ff9f43",
  "Alto riesgo de insolvencia o riesgo alto": "#ff4d6d",
  Irrecuperable: "#c0392b",
  "Sin información": "#64748b",
  Desconocida: "#94a3b8",
};

export default function Barras({ data }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = Object.keys(data);
    const values = Object.values(data);

    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((l) => SITUACION_COLORS[l] || "#00d4ff"),
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: labels.map((l) => (SITUACION_COLORS[l] || "#00d4ff") + "cc"),
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 800 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e2d45",
            titleColor: "#e2e8f0",
            bodyColor: "#94a3b8",
            borderColor: "#2d3f5a",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (ctx) => ` $${ctx.parsed.y.toLocaleString("es-AR")} miles`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#64748b",
              font: { family: "'DM Mono', monospace", size: 10 },
              maxRotation: 35,
            },
            grid: { color: "transparent" },
          },
          y: {
            ticks: {
              color: "#64748b",
              font: { family: "'DM Mono', monospace", size: 11 },
              callback: (v) => `$${(v / 1000).toFixed(0)}k`,
            },
            grid: { color: "#1e2d45" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return <canvas ref={ref} />;
}