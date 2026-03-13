const BLUE      = "#2563EB";
const BLUE_DIM  = "rgba(37,99,235,0.1)";
const BLUE_BDR  = "rgba(37,99,235,0.3)";

export default function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, full = false }) {
  const V = {
    primary: { background: BLUE,                       color: "#ffffff", border: "none"                            },
    ghost:   { background: "transparent",              color: "#64748b", border: "1px solid rgba(255,255,255,0.1)" },
    danger:  { background: "rgba(239,68,68,0.08)",     color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)"  },
    success: { background: "rgba(34,197,94,0.08)",     color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)"  },
    amber:   { background: "rgba(245,166,35,0.1)",     color: "#F5A623", border: "1px solid rgba(245,166,35,0.25)" },
  };
  const S   = V[variant] || V.ghost;
  const pad = size === "sm" ? "6px 12px" : size === "lg" ? "12px 26px" : "9px 18px";
  const fs  = size === "sm" ? 11 : size === "lg" ? 13 : 12;

  const hoverBg = {
    primary: "#1d4ed8",
    ghost:   "rgba(255,255,255,0.06)",
    danger:  "rgba(239,68,68,0.14)",
    success: "rgba(34,197,94,0.14)",
    amber:   "rgba(245,166,35,0.18)",
  };
  const hoverColor = {
    primary: "#ffffff",
    ghost:   "#94a3b8",
    danger:  "#ef4444",
    success: "#22c55e",
    amber:   "#F5A623",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...S,
        padding: pad,
        borderRadius: 7,
        fontFamily: "'Inter', sans-serif",
        fontSize: fs,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 0.15s, color 0.15s",
        letterSpacing: "0.01em",
        width: full ? "100%" : "auto",
        whiteSpace: "nowrap",
        outline: "none",
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg[variant] || hoverBg.ghost;
          e.currentTarget.style.color      = hoverColor[variant] || hoverColor.ghost;
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.background = S.background;
          e.currentTarget.style.color      = S.color;
        }
      }}
    >
      {children}
    </button>
  );
}