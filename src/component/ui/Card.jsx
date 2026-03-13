// component/ui/card.jsx
export default function Card({ children, title, action, noPad = false, style = {} }) {
  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 11, overflow: "hidden", ...style,
    }}>
      {title && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Card title — was #94a3b8 (dim), now clearly readable */}
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 800,
            color: "#cbd5e1", letterSpacing: "0.01em",
          }}>
            {title}
          </span>
          {action}
        </div>
      )}
      <div style={noPad ? {} : { padding: "4px 0" }}>{children}</div>
    </div>
  );
}