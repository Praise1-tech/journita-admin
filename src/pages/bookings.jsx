import { useState, useEffect } from "react";
import { BOOKING_TYPE_META, fmt, useDebounce, apiFetch } from "../lib";
import Card        from "../component/ui/card";
import StatCard    from "../component/ui/StatCard";
import Table       from "../component/ui/Table";
import Badge       from "../component/ui/Badge";
import Btn         from "../component/ui/Btn";
import SearchInput from "../component/ui/SearchInput";
import Select      from "../component/ui/Select";
import PageHeader  from "../component/ui/PageHeader";

const detailStr = (bk) => {
  if (bk.type === "flight") return `${bk.details?.route || ""} · ${bk.details?.pnr || ""}`;
  if (bk.type === "ride")   return `${bk.details?.pickup || ""} → ${bk.details?.dropoff || ""}`;
  if (bk.type === "esim")   return bk.details?.package || "";
  if (bk.type === "hotel")  return `${bk.details?.hotel || ""} · ${bk.details?.city || ""}`;
  return "—";
};

export default function Bookings() {
  const [search,     setSearch]     = useState("");
  const [typeF,      setTypeF]      = useState("all");
  const [statF,      setStatF]      = useState("all");
  const [bookings,   setBookings]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [typeCounts, setTypeCounts] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const dSearch = useDebounce(search);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 25 });
      if (dSearch)         params.set("search", dSearch);
      if (typeF !== "all") params.set("type",   typeF);
      if (statF !== "all") params.set("status", statF);
      const { ok, data } = await apiFetch(`/bookings?${params}`);
      if (ok) {
        setBookings(data.bookings || data.data || []);
        setTotal(data.total || data.pagination?.total || 0);
        setTypeCounts(data.typeCounts || {});
      }
      setLoading(false);
    })();
  }, [dSearch, typeF, statF, page]);

  return (
    <div>
      <PageHeader
        title="Bookings"
        sub={`${total.toLocaleString()} total · flights, rides, eSIMs, hotels`}
        actions={
          <>
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search user…" width={180} />
            <Select value={typeF} onChange={v => { setTypeF(v); setPage(1); }}
              options={[{ value: "all", label: "All Types" }, ...Object.entries(BOOKING_TYPE_META).map(([k, v]) => ({ value: k, label: v.label }))]} />
            <Select value={statF} onChange={v => { setStatF(v); setPage(1); }}
              options={[{ value: "all", label: "All Status" }, { value: "completed", label: "Completed" }, { value: "confirmed", label: "Confirmed" }, { value: "cancelled", label: "Cancelled" }]} />
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
        {Object.entries(BOOKING_TYPE_META).map(([type, meta]) => (
          <StatCard key={type} label={`${meta.icon} ${meta.label}`} value={typeCounts[type] || 0} />
        ))}
      </div>

      {loading ? (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", padding: "40px 0" }}>Loading bookings…</div>
      ) : (
        <Card noPad>
          <Table
            columns={[
              { key: "createdAt", label: "Date",    render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{fmt.datetime(v)}</span> },
              { key: "userName",  label: "User",    render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94a3b8" }}>{v}</span> },
              { key: "type",      label: "Service", render: v => { const m = BOOKING_TYPE_META[v] || {}; return <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: m.color || "#94a3b8" }}>{m.icon} {m.label || v}</span>; } },
              { key: "details",   label: "Details", render: (_, row) => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{detailStr(row)}</span> },
              { key: "amount",    label: "Amount",  render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0", fontWeight: 700 }}>{fmt.naira(v)}</span> },
              { key: "status",    label: "Status",  render: v => <Badge variant={v}>{v}</Badge> },
            ]}
            data={bookings}
            emptyMsg="No bookings found."
          />
          {total > 25 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 0" }}>
              <Btn size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", alignSelf: "center" }}>Page {page} of {Math.ceil(total / 25)}</span>
              <Btn size="sm" variant="ghost" disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(p => p + 1)}>Next →</Btn>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}