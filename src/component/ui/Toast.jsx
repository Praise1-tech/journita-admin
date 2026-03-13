import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3600);
    return () => clearTimeout(t);
  }, [onClose]);

  const C = { success: "#22c55e", error: "#ef4444", info: "#60a5fa" };

  return (
    <div style={{
      position: "fixed", bottom: 22, right: 22, zIndex: 300,
      background: "#111827",
      border: `1px solid ${C[type]}33`,
      borderLeft: `3px solid ${C[type]}`,
      borderRadius: 8, padding: "11px 16px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
      minWidth: 260, maxWidth: 380,
      animation: "toastIn 0.2s ease",
    }}>
      <span style={{ color: C[type], fontSize: 13, flexShrink: 0 }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "i"}
      </span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8", flex: 1, lineHeight: 1.5 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  );
}