import { useState, useEffect, useContext } from "react";
import { RouterCtx } from "../App";
import { ROUTES, TX_TYPE_META, BOOKING_TYPE_META, fmt, apiFetch } from "../lib";
import Card       from "../component/ui/card";
import StatCard   from "../component/ui/StatCard";
import Table      from "../component/ui/Table";
import Badge      from "../component/ui/Badge";
import Btn        from "../component/ui/Btn";
import PageHeader from "../component/ui/PageHeader";

export default function Dashboard() {
  const { navigate } = useContext(RouterCtx);

  const [stats,            setStats]            = useState(null);
  const [recentTx,         setRecentTx]         = useState([]);
  const [recentBk,         setRecentBk]         = useState([]);
  const [bookingBreakdown, setBookingBreakdown] = useState({});
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [sRes, tRes, bRes] = await Promise.all([
        apiFetch("/stats"),
        apiFetch("/transactions?limit=6"),
        apiFetch("/bookings?limit=5"),
      ]);

      if (sRes.ok) {
        const s = sRes.data.stats || sRes.data;
        setStats(s);
        setBookingBreakdown(s.typeCounts || {});
      }

      if (tRes.ok) setRecentTx(tRes.data.transactions || []);
      if (bRes.ok) setRecentBk(bRes.data.bookings || []);

      setLoading(false);
    })();
  }, []);

  const s = stats || {};

  if (loading) return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", padding: "40px 0" }}>
      Loading dashboard…
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Overview"
        sub={`Live platform metrics · ${fmt.date(new Date())}`}
      />

      {/* KPI Grid */}
      <div className="grid-stats">
        <StatCard label="Total Users"    value={(s.totalUsers || 0).toLocaleString()}     sub={`+${s.activeToday || 0} active today`}       accent onClick={() => navigate(ROUTES.USERS)} />
        <StatCard label="Total Revenue"  value={fmt.naira(s.totalRevenue || 0)}           sub={`${fmt.naira(s.revenueToday || 0)} today`}   />
        <StatCard label="Wallet Funds"   value={fmt.naira(s.totalWalletBalance || 0)}     sub="Across all wallets"                          />
        <StatCard label="Total Bookings" value={(s.totalBookings || 0).toLocaleString()}  sub={`${s.bookingsToday || 0} today`}             />
        <StatCard label="Flagged Users"  value={s.flaggedUsers || 0}                      sub="Needs review" onClick={() => navigate(ROUTES.SECURITY)} />
        <StatCard label="Pending KYC"    value={s.pendingKYC || 0}                        sub="Awaiting verification"                       />
      </div>

      {/* Recent tables */}
      <div className="grid-2col">
        <Card
          title="Recent Transactions"
          action={<Btn size="sm" variant="ghost" onClick={() => navigate(ROUTES.TRANSACTIONS)}>All →</Btn>}
          noPad
        >
          <Table
            columns={[
              { key: "userName", label: "User",   render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94a3b8" }}>{v}</span> },
              { key: "type",     label: "Type",   render: v => { const m = TX_TYPE_META[v] || {}; return <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: m.color || "#94a3b8", background: m.bg, padding: "2px 6px", borderRadius: 3 }}>{m.label || v}</span>; } },
              { key: "amount",   label: "Amount", render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: v < 0 ? "#ef4444" : "#22c55e" }}>{v < 0 ? `−${fmt.naira(Math.abs(v))}` : fmt.naira(v)}</span> },
              { key: "status",   label: "Status", render: v => <Badge variant={v}>{v}</Badge> },
            ]}
            data={recentTx}
            emptyMsg="No transactions yet."
          />
        </Card>

        <Card
          title="Recent Bookings"
          action={<Btn size="sm" variant="ghost" onClick={() => navigate(ROUTES.BOOKINGS)}>All →</Btn>}
          noPad
        >
          <Table
            columns={[
              { key: "userName", label: "User",   render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94a3b8" }}>{v}</span> },
              { key: "type",     label: "Type",   render: v => { const m = BOOKING_TYPE_META[v] || {}; return <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: m.color || "#94a3b8" }}>{m.icon} {m.label || v}</span>; } },
              { key: "amount",   label: "Amount", render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#e2e8f0" }}>{fmt.naira(v)}</span> },
              { key: "status",   label: "Status", render: v => <Badge variant={v}>{v}</Badge> },
            ]}
            data={recentBk}
            emptyMsg="No bookings yet."
          />
        </Card>
      </div>

      {/* Bookings by service */}
      <div style={{ marginTop: 14 }}>
        <Card title="Bookings by Service">
          <div className="grid-5col" style={{ padding: "14px 18px" }}>
            {Object.entries(BOOKING_TYPE_META).map(([type, meta]) => {
              const count = bookingBreakdown[type] || 0;
              const total = Object.values(bookingBreakdown).reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={type} style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 900, color: meta.color }}>{count}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{meta.icon} {meta.label}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#334155", marginTop: 2 }}>{pct}% of total</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}