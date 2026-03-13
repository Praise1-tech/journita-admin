import { useState, useCallback, createContext } from "react";
import { ROUTES } from "./lib/index";

// Auth
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Sidebar from "./component/layouts/Sidebar";
import Topbar  from "./component/layouts/Topbar";

// UI
import Toast from "./component/ui/Toast";

// Pages
import Login        from "./pages/login";
import Settings     from "./pages/settings";
import Dashboard    from "./pages/Dashboard";
import Users        from "./pages/users";
import UserDetail   from "./pages/UserDetail";
import Transactions from "./pages/transactions";
import Bookings     from "./pages/bookings";
import Bonus        from "./pages/Bonus";
import Feed         from "./pages/Feed";
import Security     from "./pages/security";

// ── Router Context (exported so pages can import it) ──────────────────────────
export const RouterCtx = createContext(null);

// ── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  [ROUTES.DASHBOARD]:    "Overview",
  [ROUTES.USERS]:        "Users",
  [ROUTES.USER_DETAIL]:  "User Detail",
  [ROUTES.TRANSACTIONS]: "Transactions",
  [ROUTES.BOOKINGS]:     "Bookings",
  [ROUTES.BONUS]:        "Bonus & Promotions",
  [ROUTES.SECURITY]:     "Security",
  [ROUTES.FEED]:         "Feed Moderation",
  [ROUTES.SETTINGS]:     "Settings",
};

// ── Inner shell — only renders when authenticated ─────────────────────────────
function AdminShell() {
  const { admin, handleLogout } = useAuth();

  const [route,      setRoute]      = useState(ROUTES.DASHBOARD);
  const [routeData,  setRouteData]  = useState(null);
  const [toast,      setToast]      = useState(null);
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useCallback((r, data = null) => {
    setRoute(r);
    setRouteData(data);
    setMobileOpen(false);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const renderPage = () => {
    switch (route) {
      case ROUTES.DASHBOARD:    return <Dashboard />;
      case ROUTES.USERS:        return <Users />;
      case ROUTES.USER_DETAIL:  return <UserDetail user={routeData} />;
      case ROUTES.TRANSACTIONS: return <Transactions />;
      case ROUTES.BOOKINGS:     return <Bookings />;
      case ROUTES.BONUS:        return <Bonus />;
      case ROUTES.SECURITY:     return <Security />;
      case ROUTES.FEED:         return <Feed />;
      case ROUTES.SETTINGS:     return <Settings />;
      default:                  return <Dashboard />;
    }
  };

  return (
    <RouterCtx.Provider value={{ navigate, route, showToast }}>

      <div style={{ display: "flex", minHeight: "100vh", background: "#060a0f" }}>

        {/* ── Desktop sidebar (sticky, collapsible) ── */}
        <div className="sidebar-desktop">
          <Sidebar
            current={route}
            navigate={navigate}
            collapsed={collapsed}
            onToggle={() => setCollapsed(c => !c)}
          />
        </div>

        {/* ── Mobile: backdrop overlay + slide-in drawer ── */}
        {mobileOpen && (
          <>
            <div
              className="sidebar-mobile-overlay"
              onClick={() => setMobileOpen(false)}
            />
            <div className="sidebar-mobile-drawer">
              <Sidebar
                current={route}
                navigate={navigate}
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── Main column ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>

          <Topbar
            pageTitle={PAGE_TITLES[route] || ""}
            admin={admin}
            onLogout={handleLogout}
            onMenuToggle={() => setMobileOpen(o => !o)}
          />

          {/* Scanline overlay */}
          <div style={{
            position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 4px)",
          }} />

          {/* Page content */}
          <main className="main-content" style={{ position: "relative", zIndex: 1, padding: "26px 28px", flex: 1, minWidth: 0 }}>
            {renderPage()}
          </main>

        </div>
      </div>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </RouterCtx.Provider>
  );
}

// ── Auth gate ─────────────────────────────────────────────────────────────────
function AuthGate() {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Login />;
  return <AdminShell />;
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #060a0f; color: #e2e8f0; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        select option { background: #0d1117; color: #e2e8f0; }

        @keyframes toastIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        /* ── Sidebar layout ── */
        .sidebar-desktop        { position: sticky; top: 0; height: 100vh; display: flex; flex-shrink: 0; }
        .sidebar-mobile-overlay { display: none; }
        .mob-menu-btn           { display: none !important; }

        /* ── Responsive grids ── */
        .grid-stats  { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px,1fr)); gap: 10px; margin-bottom: 22px; }
        .grid-2col   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .grid-3col   { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
        .grid-4col   { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
        .grid-5col   { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px;  margin-bottom: 18px; }
        .grid-bktype { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-bottom: 20px; }

        /* ── Tables ── */
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* ── Tablet (960px) ── */
        @media (max-width: 960px) {
          .sidebar-desktop { display: none !important; }
          .mob-menu-btn    { display: flex !important; }

          .sidebar-mobile-overlay {
            display: block;
            position: fixed; inset: 0; z-index: 200;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(3px);
          }
          .sidebar-mobile-drawer {
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 201;
            animation: slideIn 0.22s ease;
          }

          .main-content { padding: 18px 16px !important; }
          .grid-5col    { grid-template-columns: repeat(3,1fr) !important; }
          .grid-bktype  { grid-template-columns: repeat(3,1fr) !important; }
          .grid-4col    { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* ── Mobile (640px) ── */
        @media (max-width: 640px) {
          .hide-sm      { display: none !important; }
          .main-content { padding: 14px 12px !important; }
          .grid-2col    { grid-template-columns: 1fr !important; }
          .grid-3col    { grid-template-columns: repeat(2,1fr) !important; }
          .grid-4col    { grid-template-columns: repeat(2,1fr) !important; }
          .grid-5col    { grid-template-columns: repeat(2,1fr) !important; }
          .grid-bktype  { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* ── Small mobile (400px) ── */
        @media (max-width: 400px) {
          .hide-xs      { display: none !important; }
          .main-content { padding: 10px 8px !important; }
          .grid-3col    { grid-template-columns: 1fr !important; }
          .grid-4col    { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* ── Android small (360px) ── */
        @media (max-width: 360px) {
          .main-content { padding: 8px 6px !important; }
          .grid-2col    { grid-template-columns: 1fr !important; }
          .grid-3col    { grid-template-columns: 1fr !important; }
          .grid-4col    { grid-template-columns: repeat(2,1fr) !important; }
          .grid-5col    { grid-template-columns: repeat(2,1fr) !important; }
          .grid-bktype  { grid-template-columns: repeat(2,1fr) !important; }
          .grid-stats   { grid-template-columns: repeat(2,1fr) !important; }
          .hide-xs      { display: none !important; }
        }
      `}</style>

      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </>
  );
}