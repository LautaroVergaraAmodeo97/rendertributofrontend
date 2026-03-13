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

export default function Torta({ data }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map((l) => SITUACION_COLORS[l] || "#64748b");

    chartRef.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 3,
            borderColor: "#111827",
            hoverBorderColor: "#1e2d45",
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "74%",
        animation: { animateScale: true, duration: 800 },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94a3b8",
              font: { family: "'DM Mono', monospace", size: 11 },
              padding: 14,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            backgroundColor: "#1e2d45",
            titleColor: "#e2e8f0",
            bodyColor: "#94a3b8",
            borderColor: "#2d3f5a",
            borderWidth: 1,
            padding: 12,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return <canvas ref={ref} />;
}