const fmt = {
  initials: (name) => (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
};

export default function Avatar({ name, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: "#0f172a",
      border: "1px solid rgba(37,99,235,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: size * 0.33,
        color: "#2563EB",
        fontWeight: 700,
      }}>
        {fmt.initials(name)}
      </span>
    </div>
  );
}