export default function StatCard({ label, value, sub, accent = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#0d1117",
        border: `1px solid ${accent ? "rgba(37,99,235,0.28)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 10, padding: "18px 20px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => {
        if (onClick) e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
        else e.currentTarget.style.borderColor = accent ? "rgba(37,99,235,0.55)" : "rgba(255,255,255,0.11)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = accent ? "rgba(37,99,235,0.28)" : "rgba(255,255,255,0.06)";
      }}
    >
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, #2563EB 0%, transparent 100%)",
        }} />
      )}
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
        color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
        color: accent ? "#2563EB" : "#e2e8f0", lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          color: "#475569", marginTop: 8,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}