"use client";
import { useEffect, useState } from "react";
import { Syne, DM_Mono } from "next/font/google";
import StatCard from "@/components/cartas";
import DonutChart from "@/components/torta";
import BarChart from "@/components/barras";
import HBarChart from "@/components/barras_horizontales";
import Link from "next/link";

const syne = Syne({ subsets: ["latin"], weight: ["400", "700", "800"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const API_BASE = "https://rendertributo.onrender.com";

export default function Home() {
  const [resumen, setResumen] = useState(null);
  const [topEntidades, setTopEntidades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API_BASE}/analisis/resumen`).then((r) => r.json()),
          fetch(`${API_BASE}/analisis/top-entidades?top=5`).then((r) => r.json()),
        ]);
        setResumen(r1);
        setTopEntidades(r2);
      } catch (e) {
        setError("No se pudo conectar con la API. Verificá que el backend esté corriendo en localhost:8000");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const montoTotal = resumen?.monto_por_situacion
    ? Object.values(resumen.monto_por_situacion).reduce((a, b) => a + b, 0)
    : null;

  return (
    <main
      className={syne.className}
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "#e2e8f0",
        padding: "48px 40px",
      }}
    >
      {/* Fondo con textura sutil */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 20% 20%, #00d4ff08 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #0066ff08 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto" }}>

        {/* Header */}
        <Link href="/consulta" style={{ color: "#00d4ff", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
          Consulta por CUIT →
          </Link>
        <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 5,
              height: 56,
              background: "linear-gradient(180deg, #00d4ff, #0066ff)",
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
              Central de Deudores
            </h1>
            <p
              className={dmMono.className}
              style={{ color: "#64748b", fontSize: 12, marginTop: 6, letterSpacing: 2 }}
            >
              
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              color: "#64748b",
            }}
            className={dmMono.className}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #1e2d45",
                borderTop: "3px solid #00d4ff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Cargando datos desde la API...
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className={dmMono.className}
            style={{
              background: "#1a0a0a",
              border: "1px solid #ff4d6d",
              borderRadius: 12,
              padding: "20px 24px",
              color: "#ff4d6d",
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Contenido */}
        {resumen && (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <StatCard
                label="Registros de Deuda"
                value={resumen.total_registros?.toLocaleString("es-AR")}
                color="#00d4ff"
                icon="📋"
              />
              <StatCard
                label="CUITs Únicos"
                value={resumen.cuits_unicos?.toLocaleString("es-AR")}
                color="#f0b429"
                icon="🏢"
              />
              <StatCard
                label="Monto Total (miles $)"
                value={montoTotal ? `$${montoTotal.toLocaleString("es-AR")}` : "—"}
                color="#00e096"
                icon="💰"
              />
              <StatCard
                label="Tipos de Situación"
                value={
                  resumen.distribucion_situaciones
                    ? Object.keys(resumen.distribucion_situaciones).length
                    : "—"
                }
                color="#ff4d6d"
                icon="📊"
              />
            </div>

            {/* Gráficos superiores */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1e2d45",
                  borderRadius: 16,
                  padding: 28,
                }}
              >
                <h3
                  className={dmMono.className}
                  style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 20, textTransform: "uppercase" }}
                >
                  Distribución por Situación
                </h3>
                <DonutChart data={resumen.distribucion_situaciones} />
              </div>

              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1e2d45",
                  borderRadius: 16,
                  padding: 28,
                }}
              >
                <h3
                  className={dmMono.className}
                  style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 20, textTransform: "uppercase" }}
                >
                  Monto Total por Situación (miles $)
                </h3>
                <BarChart data={resumen.monto_por_situacion} />
              </div>
            </div>

            {/* Top entidades */}
            {topEntidades && (
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1e2d45",
                  borderRadius: 16,
                  padding: 28,
                }}
              >
                <h3
                  className={dmMono.className}
                  style={{ color: "#64748b", fontSize: 11, letterSpacing: 2, marginBottom: 20, textTransform: "uppercase" }}
                >
                  Top 5 Entidades con Mayor Deuda (miles $)
                </h3>
                <HBarChart data={topEntidades} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
