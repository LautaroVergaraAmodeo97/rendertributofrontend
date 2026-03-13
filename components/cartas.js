export default function Carta({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 3,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            color: "var(--muted)",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {icon && <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>}
      </div>
      <span
        style={{
          color,
          fontSize: 34,
          fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          letterSpacing: -1.5,
          lineHeight: 1,
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}