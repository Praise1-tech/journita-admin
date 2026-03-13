import { useState, useEffect, useCallback, useContext } from "react";
import { RouterCtx } from "../App";
import { fmt, apiFetch } from "../lib";
import Card       from "../component/ui/card";
import StatCard   from "../component/ui/StatCard";
import Table      from "../component/ui/Table";
import Btn        from "../component/ui/Btn";
import Input      from "../component/ui/Input";
import PageHeader from "../component/ui/PageHeader";

const BLUE     = "#2563EB";
const BLUE_BG  = "rgba(37,99,235,0.08)";
const BLUE_BDR = "rgba(37,99,235,0.35)";

const TABS = [{ k: "single", l: "Single User" }, { k: "bulk", l: "Campaign" }, { k: "stats", l: "Stats" }];

const TARGET_DEFS = [
  { value: "all",        label: "All Active Users"        },
  { value: "no_booking", label: "No Bookings (0 total)"   },
  { value: "frequent",   label: "Frequent Travelers (5+)" },
  { value: "in_debt",    label: "Users in Debt"           },
];

export default function Bonus() {
  const { showToast } = useContext(RouterCtx);

  const [tab,          setTab]          = useState("single");
  const [loading,      setLoading]      = useState(false);
  const [form,         setForm]         = useState({ type: "give", email: "", amount: "", reason: "" });
  const [errors,       setErrors]       = useState({});
  const [bulk,         setBulk]         = useState({ name: "", amount: "", target: "all" });
  const [bonusStats,   setBonusStats]   = useState(null);
  const [bonusTx,      setBonusTx]      = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const [audienceCounts, setAudienceCounts] = useState({
    all: "…", no_booking: "…", frequent: "…", in_debt: "…",
  });

  useEffect(() => {
    (async () => {
      const { ok, data } = await apiFetch("/bonus/audience-counts");
      if (ok && data.counts) setAudienceCounts(data.counts);
    })();
  }, []);

  const targets = TARGET_DEFS.map(t => ({
    ...t,
    est: audienceCounts[t.value] !== undefined ? String(audienceCounts[t.value]) : "…",
  }));

  const fetchBonusStats = useCallback(async () => {
    setStatsLoading(true);
    const [sRes, tRes] = await Promise.all([
      apiFetch("/bonus/stats"),
      apiFetch("/transactions?type=bonus&limit=20"),
    ]);
    if (sRes.ok) setBonusStats(sRes.data.stats || sRes.data);
    if (tRes.ok) setBonusTx(tRes.data.transactions || tRes.data.data || []);
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "stats") fetchBonusStats();
  }, [tab, fetchBonusStats]);

  const handleSingle = async () => {
    const errs = {};
    const amt  = parseFloat((form.amount || "").replace(/,/g, ""));
    if (!form.email)                            errs.email  = "Required";
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = "Enter valid amount";
    if (!form.reason)                           errs.reason = "Required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const endpoint = form.type === "give" ? "/bonus/give" : "/bonus/remove";
    const { ok, data } = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ email: form.email, amount: amt, reason: form.reason }),
    });
    setLoading(false);

    if (!ok) { showToast(data.message || "Operation failed", "error"); return; }
    showToast(`${form.type === "give" ? "Bonus given" : "Bonus removed"}: ${fmt.naira(amt)} → ${form.email}`, "success");
    setForm({ type: form.type, email: "", amount: "", reason: "" });
    setErrors({});
    if (tab === "stats") fetchBonusStats();
  };

  const handleCampaign = async () => {
    const amt = parseFloat((bulk.amount || "").replace(/,/g, ""));
    if (!bulk.name.trim() || isNaN(amt) || amt <= 0) {
      showToast("Campaign name and amount are required", "error");
      return;
    }
    setLoading(true);
    const { ok, data } = await apiFetch("/bonus/campaign", {
      method: "POST",
      body: JSON.stringify({ campaignName: bulk.name, amount: amt, target: bulk.target }),
    });
    setLoading(false);
    if (!ok) { showToast(data.message || "Campaign failed", "error"); return; }
    showToast(`Campaign "${bulk.name}" queued · ${fmt.naira(amt)} per user`, "success");
    setBulk({ name: "", amount: "", target: "all" });
  };

  return (
    <div>
      <PageHeader title="Bonus & Promotions" sub="Give, remove, or campaign bonus credits to users" />

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 3, background: "#060a0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: 3, width: "fit-content", marginBottom: 26 }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{
              padding: "7px 18px", borderRadius: 6, border: "none",
              background: tab === t.k ? BLUE : "transparent",
              color: tab === t.k ? "#ffffff" : "#64748b",
              fontFamily: "'Inter', sans-serif", fontSize: 11,
              fontWeight: tab === t.k ? 700 : 400,
              cursor: "pointer", transition: "all 0.15s",
            }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Single User Tab ── */}
      {tab === "single" && (
        <div style={{ maxWidth: 460 }}>
          <Card title="Bonus Operation — Single User">
            <div style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {["give", "remove"].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                    style={{
                      flex: 1, padding: "10px 0",
                      border: `1px solid ${form.type === t ? (t === "give" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 7,
                      background: form.type === t ? (t === "give" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)") : "transparent",
                      color: form.type === t ? (t === "give" ? "#22c55e" : "#ef4444") : "#64748b",
                      fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {t === "give" ? "+ Give Bonus" : "− Remove Bonus"}
                  </button>
                ))}
              </div>
              <Input label="User Email"  value={form.email}  onChange={v => setForm(f => ({ ...f, email: v }))}  placeholder="user@example.com"                    error={errors.email}  />
              <Input label="Amount (₦)"  value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} placeholder="e.g. 5000"                            error={errors.amount} />
              <Input label="Reason"      value={form.reason} onChange={v => setForm(f => ({ ...f, reason: v }))} placeholder="Referral reward, compensation, promo…" error={errors.reason} />
              <div style={{ marginTop: 8 }}>
                <Btn variant={form.type === "give" ? "success" : "danger"} full onClick={handleSingle} disabled={loading}>
                  {loading ? "Processing…" : form.type === "give" ? "Give Bonus" : "Remove Bonus"}
                </Btn>
              </div>
              <div style={{ marginTop: 14, padding: "9px 12px", background: "#060a0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#475569", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.07em" }}>Endpoint</div>
                <code style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#60a5fa" }}>
                  /api/admin/{form.type === "give" ? "give" : "remove"}
                </code>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Campaign Tab ── */}
      {tab === "bulk" && (
        <div style={{ maxWidth: 500 }}>
          <Card title="Promotional Campaign">
            <div style={{ padding: "18px 22px" }}>
              <Input label="Campaign Name"             value={bulk.name}   onChange={v => setBulk(b => ({ ...b, name: v }))}   placeholder="e.g. March Madness Promo" />
              <Input label="Bonus Amount per User (₦)" value={bulk.amount} onChange={v => setBulk(b => ({ ...b, amount: v }))} placeholder="e.g. 2500" />

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Target Audience</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {targets.map(t => (
                    <button key={t.value} onClick={() => setBulk(b => ({ ...b, target: t.value }))}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 13px",
                        border: `1px solid ${bulk.target === t.value ? BLUE_BDR : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 7,
                        background: bulk.target === t.value ? BLUE_BG : "transparent",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${bulk.target === t.value ? BLUE : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {bulk.target === t.value && <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE }} />}
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: bulk.target === t.value ? "#e2e8f0" : "#64748b" }}>{t.label}</span>
                      </div>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569" }}>{t.est} users</span>
                    </button>
                  ))}
                </div>
              </div>

              {bulk.amount && (
                <div style={{ background: BLUE_BG, border: `1px solid ${BLUE_BDR}`, borderRadius: 7, padding: "9px 13px", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#60a5fa" }}>
                    Est. total payout: {fmt.naira(
                      parseFloat(bulk.amount.replace(/,/g, "") || "0") *
                      (Number(targets.find(t => t.value === bulk.target)?.est) || 0)
                    )}
                  </span>
                </div>
              )}

              <Btn variant="primary" full onClick={handleCampaign} disabled={loading}>
                {loading ? "Queuing Campaign…" : "Launch Campaign"}
              </Btn>
              <div style={{ marginTop: 14, padding: "9px 12px", background: "#060a0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7 }}>
                <code style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#60a5fa" }}>
                  /admin/bonus
                </code>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Stats Tab ── */}
      {tab === "stats" && (
        <div>
          {statsLoading ? (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569", padding: "40px 0" }}>
              Loading stats…
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10, marginBottom: 22 }}>
                <StatCard label="Total Bonus Given"  value={fmt.naira(bonusStats?.totalGiven  || 0)} sub="All time"                                              accent />
                <StatCard label="Total Bonus Used"   value={fmt.naira(bonusStats?.totalUsed   || 0)} sub={`${bonusStats?.utilisationRate || 0}% utilisation`}          />
                <StatCard label="Outstanding Bonus"  value={fmt.naira(bonusStats?.outstanding || 0)} sub="Sitting in wallets"                                          />
                <StatCard label="Users With Bonus"   value={bonusStats?.usersWithBonus         || 0} sub={`of ${bonusStats?.totalUsers || 0} total users`}             />
              </div>
              <Card title="Recent Bonus Transactions" noPad>
                <Table
                  columns={[
                    { key: "timestamp",   label: "Time",   render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569" }}>{fmt.datetime(v)}</span> },
                    { key: "userName",    label: "User",   render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94a3b8" }}>{v}</span> },
                    { key: "amount",      label: "Amount", render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: "#F5A623" }}>{fmt.naira(v)}</span> },
                    { key: "description", label: "Reason", render: v => <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569" }}>{v}</span> },
                  ]}
                  data={bonusTx}
                  emptyMsg="No bonus transactions yet."
                />
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}