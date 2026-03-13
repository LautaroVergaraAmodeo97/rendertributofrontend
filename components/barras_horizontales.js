"use client";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const ACCENT_COLORS = ["#00d4ff", "#0066ff", "#f0b429", "#00e096", "#ff4d6d"];

export default function BarrasHorizontales({ data }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: data.map((d) => `Entidad ${d.entidad}`),
        datasets: [
          {
            data: data.map((d) => d.monto_total),
            backgroundColor: ACCENT_COLORS,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
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
              label: (ctx) => ` $${ctx.parsed.x.toLocaleString("es-AR")} miles`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#64748b",
              font: { family: "'DM Mono', monospace", size: 11 },
              callback: (v) => `$${(v / 1000).toFixed(0)}k`,
            },
            grid: { color: "#1e2d45" },
          },
          y: {
            ticks: {
              color: "#e2e8f0",
              font: { family: "'DM Mono', monospace", size: 11 },
            },
            grid: { color: "transparent" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return <canvas ref={ref} />;
}