import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, width = 460 }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)",
        }}
      />
      {/* Panel */}
      <div style={{
        position: "relative", width, maxWidth: "calc(100vw - 32px)",
        maxHeight: "88vh", overflowY: "auto",
        background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#4a5568", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}