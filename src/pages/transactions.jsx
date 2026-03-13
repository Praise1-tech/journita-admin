import { useState, useEffect } from "react";
import { TX_TYPE_META, fmt, useDebounce, apiFetch } from "../lib";
import Card        from "../component/ui/card";
import StatCard    from "../component/ui/StatCard";
import Table       from "../component/ui/Table";
import Badge       from "../component/ui/Badge";
import Btn         from "../component/ui/Btn";
import SearchInput from "../component/ui/SearchInput";
import Select      from "../component/ui/Select";
import PageHeader  from "../component/ui/PageHeader";

export default function Transactions() {
  const [search,       setSearch]  = useState("");
  const [typeF,        setTypeF]   = useState("all");
  const [statF,        setStatF]   = useState("all");
  const [transactions, setTx]      = useState([]);
  const [total,        setTotal]   = useState(0);
  const [summary,      setSummary] = useState({ inflow: 0, outflow: 0 });
  const [loading,      setLoading] = useState(true);
  const [page,         setPage]    = useState(1);
  const dSearch = useDebounce(search);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 25 });
      if (dSearch)         params.set("search", dSearch);
      if (typeF !== "all") params.set("type",   typeF);
      if (statF !== "all") params.set("status", statF);
      const { ok, data } = await apiFetch(`/transactions?${params}`);
      if (ok) {
        setTx(data.transactions || data.data || []);
        setTotal(data.total || data.pagination?.total || 0);
        setSummary({ inflow: data.inflow || 0, outflow: data.outflow || 0 });
      }
      setLoading(false);
    })();
  }, [dSearch, typeF, statF, page]);

  return (
    <div>
      <PageHeader
        title="Transactions"
        sub={`${total.toLocaleString()} total records`}
        actions={
          <>
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="User or reference…" width={190} />
            <Select value={typeF} onChange={v => { setTypeF(v); setPage(1); }}
              options={[{ value: "all", label: "All Types" }, ...Object.entries(TX_TYPE_META).map(([k, v]) => ({ value: k, label: v.label }))]} />
            <Select value={statF} onChange={v => { setStatF(v); setPage(1); }}
              options={[{ value: "all", label: "All Status" }, { value: "successful", label: "Successful" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }]} />
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Inflow"  value={fmt.naira(summary.inflow)}  sub="Total credits" accent />
        <StatCard label="Outflow" value={fmt.naira(summary.outflow)} sub="Total debits" />
        <StatCard label="Records" value={total.toLocaleString()}     sub="Matching results" />
      </div>

      {loading ? (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", padding: "40px 0" }}>Loading transactions…</div>
      ) : (
        <Card noPad>
          <Table
            columns={[
              { key: "timestamp",     label: "Time",      render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{fmt.datetime(v)}</span> },
              { key: "userName",      label: "User",      render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94a3b8" }}>{v}</span> },
              { key: "type",          label: "Type",      render: v => { const m = TX_TYPE_META[v] || {}; return <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: m.color || "#94a3b8", background: m.bg, padding: "2px 7px", borderRadius: 3 }}>{m.label || v}</span>; } },
              { key: "amount",        label: "Amount",    render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: v < 0 ? "#ef4444" : "#22c55e" }}>{v < 0 ? `−${fmt.naira(Math.abs(v))}` : fmt.naira(v)}</span> },
              { key: "balanceBefore", label: "Before",    render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{fmt.naira(v)}</span> },
              { key: "balanceAfter",  label: "After",     render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94a3b8" }}>{fmt.naira(v)}</span> },
              { key: "status",        label: "Status",    render: v => <Badge variant={v}>{v}</Badge> },
              { key: "provider",      label: "Provider",  render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>{v}</span> },
              { key: "reference",     label: "Reference", render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#334155" }} title={v}>{(v || "").slice(0, 16)}…</span> },
            ]}
            data={transactions}
            emptyMsg="No transactions found."
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