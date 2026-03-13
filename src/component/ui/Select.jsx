export default function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "#060a0f", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 7, padding: "8px 12px",
        fontFamily: "'Inter', sans-serif", fontSize: 12,
        color: "#94a3b8", cursor: "pointer", outline: "none",
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}