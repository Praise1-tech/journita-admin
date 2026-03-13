const BADGE_VARIANTS = {
  active:     { color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)"    },
  suspended:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"    },
  in_debt:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"   },
  pending:    { color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)"   },
  completed:  { color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)"    },
  confirmed:  { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.25)"   },
  cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"    },
  failed:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"    },
  successful: { color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)"    },
  critical:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"    },
  high:       { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"   },
  medium:     { color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)"  },
  default:    { color: "#64748b", bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.2)"   },
};

export default function Badge({ children, variant = "default", small = false }) {
  const v = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: small ? "2px 6px" : "3px 8px",
      borderRadius: 4, border: `1px solid ${v.border}`,
      background: v.bg, color: v.color,
      fontFamily: "'DM Mono', monospace",
      fontSize: small ? 9 : 10,
      fontWeight: 500, letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}