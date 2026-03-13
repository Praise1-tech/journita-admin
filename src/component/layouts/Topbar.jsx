const fmt = {
  date:     (d) => new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
  time:     (d) => new Date(d).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
  datetime: (d) => `${fmt.date(d)}, ${fmt.time(d)}`,
};

const initials = (name) => (name || "SA").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

export default function Topbar({ pageTitle, admin, onLogout, onMenuToggle }) {
  return (
    <div style={{
      height: 52, background: "#060a0f",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 22px", flexShrink: 0,
    }}>

      {/* Left — hamburger + page title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          className="mob-menu-btn"
          onClick={onMenuToggle}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 6, width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, padding: 0,
          }}
          aria-label="Open menu"
        >
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <rect y="0"    width="14" height="1.5" rx="1" fill="rgba(255,255,255,0.45)" />
            <rect y="4.75" width="10" height="1.5" rx="1" fill="rgba(255,255,255,0.45)" />
            <rect y="9.5"  width="14" height="1.5" rx="1" fill="rgba(255,255,255,0.45)" />
          </svg>
        </button>

        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
          color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          {pageTitle}
        </span>
      </div>

      {/* Right — datetime + admin info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Date/time */}
        <span className="hide-sm" style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#334155",
        }}>
          {fmt.datetime(new Date())}
        </span>

        {/* Admin info */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6, background: "#111827",
            border: "1px solid rgba(37,99,235,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#2563EB" }}>
              {initials(admin?.name)}
            </span>
          </div>

          <span className="hide-sm" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748b",
          }}>
            {admin?.name || "Super Admin"}
          </span>

          {admin?.role && (
            <span className="hide-sm" style={{
              fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, color: "#475569",
              background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)",
              padding: "2px 7px", borderRadius: 3, textTransform: "uppercase",
            }}>
              {admin.role}
            </span>
          )}
        </div>

        {/* Logout */}
        {onLogout && (
          <button onClick={onLogout}
            style={{
              background: "none", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6,
              padding: "4px 10px", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500,
              color: "#f87171", cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}