import { ROUTES } from "../../lib/index";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { route: ROUTES.DASHBOARD,    icon: "⬡", label: "Overview",      permission: null               },
  { route: ROUTES.USERS,        icon: "◈", label: "Users",          permission: "viewUsers"        },
  { route: ROUTES.TRANSACTIONS, icon: "◆", label: "Transactions",   permission: "viewTransactions" },
  { route: ROUTES.BOOKINGS,     icon: "✦", label: "Bookings",       permission: "viewBookings"     },
  { route: ROUTES.BONUS,        icon: "◉", label: "Bonus & Promo",  permission: "viewBonus"        },
  { route: ROUTES.SECURITY,     icon: "▲", label: "Security",       permission: "viewSecurity"     },
  { route: ROUTES.FEED,         icon: "◈", label: "Feed",           permission: "viewFeed"         },
  { route: ROUTES.SETTINGS,     icon: "◎", label: "Settings",       permission: null               },
];

export default function Sidebar({ current, navigate, collapsed = false, onToggle, onMobileClose }) {
  const { hasPermission } = useAuth();

  const NAV = NAV_ITEMS.filter(item =>
    item.permission === null || hasPermission(item.permission)
  );

  const handleNav = (route) => {
    navigate(route);
    if (onMobileClose) onMobileClose();
  };

  return (
    <aside style={{
      width: collapsed ? 56 : 210,
      height: "100vh",
      background: "#060a0f",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      transition: "width 0.22s ease",
      overflow: "hidden",
    }}>

      {/* ── Brand + collapse toggle ── */}
      <div style={{
        padding: collapsed ? "14px 0" : "14px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
          {collapsed ? (
            <img src="/image/logo-1.png" alt="Journita"
              style={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }} />
          ) : (
            <img src="/image/logo-1.png" alt="Journita.ai"
              style={{ height: 32, maxWidth: 150, objectFit: "contain", objectPosition: "left" }} />
          )}
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 5,
              width: 22, height: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)"; e.currentTarget.style.color = "#2563EB"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#64748b"; }}
          >
            <span style={{ fontSize: 9, lineHeight: 1 }}>{collapsed ? "▶" : "◀"}</span>
          </button>
        )}
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: "10px 6px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV.map(item => {
          const active = current === item.route || (current === ROUTES.USER_DETAIL && item.route === ROUTES.USERS);
          return (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              title={collapsed ? item.label : undefined}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 10,
                padding: collapsed ? "10px 0" : "9px 11px",
                borderRadius: 7,
                border: "none",
                background: active ? "rgba(37,99,235,0.1)" : "transparent",
                cursor: "pointer",
                marginBottom: 1,
                transition: "background 0.15s",
                textAlign: "left",
                position: "relative",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Active left bar */}
              {active && (
                <div style={{
                  position: "absolute", left: 0, top: "20%", height: "60%",
                  width: 2, background: "#2563EB", borderRadius: "0 2px 2px 0",
                }} />
              )}

              {/* Icon */}
              <span style={{
                fontSize: 13,
                color: active ? "#2563EB" : "#64748b",
                width: 16, textAlign: "center", flexShrink: 0,
              }}>
                {item.icon}
              </span>

              {/* Label */}
              {!collapsed && (
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 11,
                  color: active ? "#2563EB" : "#64748b",
                  fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap",
                }}>
                  {item.label}
                </span>
              )}

              {/* Active dot */}
              {!collapsed && active && (
                <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: collapsed ? "12px 0" : "12px 16px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column",
        alignItems: collapsed ? "center" : "flex-start",
        gap: 3, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.5)", flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#475569", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              SYSTEM ONLINE
            </span>
          )}
        </div>
        {!collapsed && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#334155" }}>v1.4.2</div>
        )}
      </div>

    </aside>
  );
}