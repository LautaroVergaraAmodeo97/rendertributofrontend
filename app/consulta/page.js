"use client";
import { useState, useEffect, useRef } from "react";
import { Syne, DM_Mono } from "next/font/google";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const syne = Syne({ subsets: ["latin"], weight: ["400", "700", "800"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = "https://rendertributo.onrender.com";

const SITUACION_MAP = {
  1: { label: "Situación Normal", color: "#00e096" },
  2: { label: "Seguimiento especial", color: "#f0b429" },
  3: { label: "Con problemas", color: "#ff9f43" },
  4: { label: "Alto riesgo", color: "#ff4d6d" },
  5: { label: "Irrecuperable", color: "#c0392b" },
  0: { label: "Sin información", color: "#64748b" },
};

function LineChart({ periodos }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!periodos || !ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    
    const periodosOrdenados = [...periodos].sort((a, b) => a.periodo - b.periodo);

    const labels = periodosOrdenados.map((p) => String(p.periodo));
    const totales = periodosOrdenados.map((p) =>
      p.entidades?.reduce((acc, e) => acc + (e.monto || 0), 0) || 0
    );

    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Deuda total (miles $)",
            data: totales,
            borderColor: "#00d4ff",
            backgroundColor: "rgba(0, 212, 255, 0.08)",
            borderWidth: 2.5,
            pointBackgroundColor: "#00d4ff",
            pointBorderColor: "#0a0e1a",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 700 },
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
            ticks: { color: "#64748b", font: { family: "'DM Mono', monospace", size: 11 } },
            grid: { color: "#1e2d45" },
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
  }, [periodos]);

  return <canvas ref={ref} />;
}

function EntidadBarChart({ periodos }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const [entidadData, setEntidadData] = useState({});

  const colors = ["#00d4ff", "#0066ff", "#f0b429", "#00e096", "#ff4d6d", "#ff9f43", "#c0392b", "#94a3b8"];

  useEffect(() => {
    if (!periodos || !ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const entidadMap = {};
    periodos.forEach((p) => {
      p.entidades?.forEach((e) => {
        const key = `Entidad ${e.entidad}`;
        entidadMap[key] = (entidadMap[key] || 0) + (e.monto || 0);
      });
    });

    setEntidadData(entidadMap);

    const labels = Object.keys(entidadMap);
    const values = Object.values(entidadMap);

    chartRef.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 700 },
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
            ticks: { display: false }, 
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
  }, [periodos]);

  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <canvas ref={ref} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
        {Object.keys(entidadData).map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length], flexShrink: 0 }} />
            <span style={{ color: "#94a3b8", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, padding: 28 }}>
      <h3
        style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 20, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Consulta() {
  const [cuit, setCuit] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function buscar() {
    if (!cuit.trim()) return;
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch(`${API_BASE}/deudashistorico/${cuit.trim()}`);
      const data = await res.json();
      if (data.errorMessages) {
        setError(data.errorMessages?.[0] || "No se encontraron datos para este CUIT.");
      } else {
        setResultado(data);
      }
    } catch (e) {
      setError("No se pudo conectar con la API. Verificá que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={syne.className}
      style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", padding: "48px 40px" }}
    >
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 20%, #00d4ff08 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #0066ff08 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 5, height: 56, background: "linear-gradient(180deg, #00d4ff, #0066ff)", borderRadius: 3 }} />
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>Consulta por CUIT</h1>
              <p className={dmMono.className} style={{ color: "#64748b", fontSize: 12, marginTop: 6, letterSpacing: 2 }}>
                BCRA · DEUDAS HISTÓRICAS
              </p>
            </div>
          </div>
          <Link
            href="/"
            className={dmMono.className}
            style={{ color: "#64748b", fontSize: 12, letterSpacing: 1, textDecoration: "none", border: "1px solid #1e2d45", borderRadius: 8, padding: "8px 16px", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#00d4ff"; e.currentTarget.style.borderColor = "#00d4ff33"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#1e2d45"; }}
          >
            ← Volver al dashboard
          </Link>
        </div>

        {/* Buscador */}
        <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <p className={dmMono.className} style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
            Ingresá el CUIT/CUIL/CDI sin guiones
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
              placeholder="Ej: 27345025443"
              className={dmMono.className}
              style={{ flex: 1, background: "#0a0e1a", border: "1px solid #1e2d45", borderRadius: 10, padding: "14px 18px", color: "#e2e8f0", fontSize: 15, outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#00d4ff")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2d45")}
            />
            <button
              onClick={buscar}
              disabled={loading}
              style={{ background: loading ? "#1e2d45" : "linear-gradient(135deg, #00d4ff, #0066ff)", border: "none", borderRadius: 10, padding: "14px 28px", color: loading ? "#64748b" : "#0a0e1a", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Syne', sans-serif", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={dmMono.className} style={{ background: "#1a0a0a", border: "1px solid #ff4d6d", borderRadius: 12, padding: "16px 20px", color: "#ff4d6d", fontSize: 13, marginBottom: 24 }}>
            ⚠ {error}
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div>
            {/* Info titular */}
            <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", gap: 32, alignItems: "center" }}>
              <div>
                <p className={dmMono.className} style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>IDENTIFICACIÓN</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#00d4ff", letterSpacing: -0.5 }}>{resultado.identificacion}</p>
              </div>
              <div style={{ width: 1, height: 40, background: "#1e2d45" }} />
              <div>
                <p className={dmMono.className} style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 6 }}>DENOMINACIÓN</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{resultado.denominacion}</p>
              </div>
            </div>

            {/* Gráficos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <ChartCard title="Evolución de deuda total por período">
                <LineChart periodos={resultado.periodos} />
              </ChartCard>
              <ChartCard title="Deuda acumulada por entidad">
                <EntidadBarChart periodos={resultado.periodos} />
              </ChartCard>
            </div>

            {/* Detalle por período */}
            {resultado.periodos?.map((periodo) => (
              <div key={periodo.periodo} style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 24, background: "linear-gradient(180deg, #00d4ff, #0066ff)", borderRadius: 2 }} />
                  <h3 className={dmMono.className} style={{ color: "#00d4ff", fontSize: 13, letterSpacing: 2 }}>
                    PERÍODO {periodo.periodo}
                  </h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {periodo.entidades?.map((entidad, idx) => {
                    const sit = SITUACION_MAP[entidad.situacion] || { label: "Desconocida", color: "#94a3b8" };
                    return (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto auto", gap: 16, alignItems: "center", background: "#0a0e1a", borderRadius: 10, padding: "14px 18px", borderLeft: `3px solid ${sit.color}` }}>
                        <span className={dmMono.className} style={{ color: "#64748b", fontSize: 11 }}>#{entidad.entidad}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: sit.color, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sit.color, flexShrink: 0 }} />
                          {sit.label}
                        </span>
                        <span className={dmMono.className} style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>
                          ${entidad.monto?.toLocaleString("es-AR")} miles
                        </span>
                        {entidad.enRevision && (
                          <span className={dmMono.className} style={{ color: "#f0b429", fontSize: 10, background: "#f0b42922", padding: "3px 8px", borderRadius: 4 }}>
                            EN REVISIÓN
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}