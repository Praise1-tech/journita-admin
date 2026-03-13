export default function Input({ label, value, onChange, placeholder, type = "text", error, textarea = false }) {
  const baseStyle = {
    width: "100%", background: "#060a0f", borderRadius: 7, padding: "10px 13px",
    fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
    border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
        }}>
          {label}
        </div>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...baseStyle, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#2563EB"}
          onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.1)"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={baseStyle}
          onFocus={e => e.target.style.borderColor = "#2563EB"}
          onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.1)"}
        />
      )}
      {error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#ef4444", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}