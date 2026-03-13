export default function SearchInput({ value, onChange, placeholder = "Search…", width = 220 }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
        color: "#64748b", fontSize: 12, pointerEvents: "none",
      }}>
        ⌕
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "#060a0f", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 7, padding: "8px 12px 8px 30px",
          fontFamily: "'Inter', sans-serif", fontSize: 12,
          color: "#e2e8f0", outline: "none", width,
        }}
        onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.4)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
      />
    </div>
  );
}