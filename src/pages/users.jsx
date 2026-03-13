import { useState, useEffect, useContext } from "react";
import { RouterCtx } from "../App";
import { ROUTES, BOOKING_TYPE_META, fmt, useDebounce, apiFetch } from "../lib";
import Card        from "../component/ui/card";
import Table       from "../component/ui/Table";
import Badge       from "../component/ui/Badge";
import Btn         from "../component/ui/Btn";
import Avatar      from "../component/ui/Avatar";
import SearchInput from "../component/ui/SearchInput";
import PageHeader  from "../component/ui/PageHeader";

export default function Users() {
  const { navigate } = useContext(RouterCtx);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const dSearch = useDebounce(search);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (dSearch)          params.set("search", dSearch);
      if (filter !== "all") {
        if (filter === "in_debt") params.set("accountStatus", "in_debt");
        else                      params.set("status", filter);
      }
      const { ok, data } = await apiFetch(`/users?${params}`);
      if (ok) {
        setUsers(data.users || data.data || []);
        setTotal(data.total || data.pagination?.total || 0);
      }
      setLoading(false);
    })();
  }, [dSearch, filter, page]);

  return (
    <div>
      <PageHeader
        title="Users"
        sub={`${total.toLocaleString()} registered users`}
        actions={
          <>
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Name or email…" width={200} />
            {["all", "active", "suspended", "in_debt"].map(f => (
              <Btn key={f} size="sm" variant={filter === f ? "primary" : "ghost"} onClick={() => { setFilter(f); setPage(1); }}>
                {f === "all" ? "All" : f === "in_debt" ? "In Debt" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Btn>
            ))}
          </>
        }
      />

      {loading ? (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", padding: "40px 0" }}>Loading users…</div>
      ) : (
        <Card noPad>
          <Table
            onRowClick={row => navigate(ROUTES.USER_DETAIL, row)}
            columns={[
              { key: "name", label: "User", render: (v, row) => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={v} size={30} />
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{v}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{row.email}</div>
                  </div>
                </div>
              )},
              { key: "wallet", label: "Wallet", render: v => (
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{fmt.naira(v?.balance?.available)}</div>
                  {v?.balance?.bonus > 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#F5A623" }}>+{fmt.naira(v.balance.bonus)} bonus</div>}
                  {v?.debt?.amount > 0   && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#ef4444" }}>−{fmt.naira(v.debt.amount)} debt</div>}
                </div>
              )},
              { key: "bookingStats", label: "Bookings", render: v => (
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94a3b8" }}>{v?.totalBookings || 0} total</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569" }}>
                    {Object.entries(v?.bookingsByType || {}).filter(([, n]) => n > 0).map(([t, n]) => `${BOOKING_TYPE_META[t]?.icon || "◆"}${n}`).join(" ")}
                  </div>
                </div>
              )},
              { key: "kyc",    label: "KYC",    render: v => <Badge variant={v?.tier >= 2 ? "completed" : v?.tier === 1 ? "pending" : "default"}>Tier {v?.tier || 0}</Badge> },
              { key: "status", label: "Status", render: (v, row) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Badge variant={v}>{v}</Badge>
                  {row.wallet?.accountStatus !== "active" && (
                    <Badge variant={row.wallet?.accountStatus === "in_debt" ? "in_debt" : "suspended"} small>{row.wallet?.accountStatus}</Badge>
                  )}
                </div>
              )},
              { key: "auth", label: "Last Login", render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{v?.lastLogin ? fmt.ago(v.lastLogin) : "—"}</span> },
              { key: "_id",  label: "", render: (_, row) => <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); navigate(ROUTES.USER_DETAIL, row); }}>View →</Btn> },
            ]}
            data={users}
            emptyMsg="No users found."
          />
          {total > 20 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 0" }}>
              <Btn size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", alignSelf: "center" }}>Page {page} of {Math.ceil(total / 20)}</span>
              <Btn size="sm" variant="ghost" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</Btn>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}