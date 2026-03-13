import { useState, useEffect, useCallback, useContext } from "react";
import { RouterCtx } from "../App";
import { fmt, apiFetch } from "../lib";
import Card       from "../component/ui/card";
import StatCard   from "../component/ui/StatCard";
import Badge      from "../component/ui/Badge";
import Btn        from "../component/ui/Btn";
import Avatar     from "../component/ui/Avatar";
import Modal      from "../component/ui/Modal";
import Input      from "../component/ui/Input";
import PageHeader from "../component/ui/PageHeader";

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2 };
const SEV_COLOR     = { critical: "#ef4444", high: "#f59e0b", medium: "#a78bfa" };

export default function Security() {
  const { showToast } = useContext(RouterCtx);
  const [flags,         setFlags]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [clearModal,    setClearModal]    = useState(false);
  const [noteModal,     setNoteModal]     = useState(false);
  const [noteText,      setNoteText]      = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await apiFetch("/security/flagged");
    if (ok) setFlags(data.flagged || data.users || data.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);
  const sorted = [...flags].sort((a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3));

  const handleClearFlags = async () => {
    setActionLoading(true);
    const { ok, data } = await apiFetch(`/security/${selected.userId}/clear-flags`, {
      method: "POST", body: JSON.stringify({ reason: noteText || "Admin review completed" }),
    });
    setActionLoading(false);
    if (!ok) { showToast(data.message || "Failed to clear flags", "error"); return; }
    showToast(`Security flags cleared — ${selected.name}`, "success");
    setClearModal(false); setNoteText(""); await fetchFlags(); setSelected(null);
  };

  const handleNote = async () => {
    if (!noteText.trim()) return;
    setActionLoading(true);
    const { ok, data } = await apiFetch(`/security/${selected.userId}/note`, {
      method: "POST", body: JSON.stringify({ note: noteText }),
    });
    setActionLoading(false);
    if (!ok) { showToast(data.message || "Failed to save note", "error"); return; }
    showToast(`Admin note saved for ${selected.name}`, "info");
    setNoteModal(false); setNoteText("");
  };

  const handleSuspend = async () => {
    setActionLoading(true);
    const { ok, data } = await apiFetch(`/users/${selected.userId}/status`, {
      method: "PATCH", body: JSON.stringify({ status: "suspended" }),
    });
    setActionLoading(false);
    if (!ok) { showToast(data.message || "Failed", "error"); return; }
    showToast(`${selected.name} suspended`, "error");
    await fetchFlags(); setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Security"
        sub={`${flags.length} flagged users · ${flags.filter(u => u.severity === "critical").length} critical, ${flags.filter(u => !u.flags?.adminReviewed).length} unreviewed`}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22 }}>
        <StatCard label="Critical" value={flags.filter(u => u.severity === "critical").length} sub="Permanent block · Admin action required" />
        <StatCard label="High"     value={flags.filter(u => u.severity === "high").length}     sub="Temporary 30-min block" />
        <StatCard label="Medium"   value={flags.filter(u => u.severity === "medium").length}   sub="Rapid transactions" accent />
      </div>

      {loading ? (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", padding: "40px 0" }}>Loading flagged users…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 14 }}>
          <Card noPad>
            {sorted.length === 0 && (
              <div style={{ padding: 44, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#334155" }}>
                No flagged users — all clear ✓
              </div>
            )}
            {sorted.map(u => (
              <div key={u.userId}
                onClick={() => setSelected(s => s?.userId === u.userId ? null : u)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer",
                  background: selected?.userId === u.userId ? "rgba(37,99,235,0.06)" : "transparent",
                  transition: "background 0.12s", borderLeft: `3px solid ${SEV_COLOR[u.severity] || "#475569"}` }}
                onMouseEnter={e => { if (selected?.userId !== u.userId) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={e => { if (selected?.userId !== u.userId) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: SEV_COLOR[u.severity] || "#475569", boxShadow: `0 0 7px ${SEV_COLOR[u.severity] || "#475569"}70`, flexShrink: 0 }} />
                <Avatar name={u.name} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", marginTop: 2 }}>{u.email}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <Badge variant={u.severity}>{u.severity}</Badge>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", marginTop: 4 }}>{fmt.naira(u.balance?.available || 0)}</div>
                </div>
                <div style={{ maxWidth: 200, fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#334155", textAlign: "right", flexShrink: 0 }}>{u.flagReason}</div>
                {!u.flags?.adminReviewed && (
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5A623", flexShrink: 0 }} title="Unreviewed" />
                )}
              </div>
            ))}
          </Card>

          {selected && (
            <Card title={selected.name} style={{ position: "sticky", top: 24, height: "fit-content" }}>
              <div style={{ padding: "14px 18px" }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Active Flags</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {selected.flags?.permanent90kFlag    && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#ef4444" }}>● PERMANENT 90K+ BLOCK</div>}
                    {selected.flags?.temporary90kFlag    && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#f59e0b" }}>● Temp 90K+ · Exp {selected.flags.temp90kExpiresAt ? fmt.datetime(selected.flags.temp90kExpiresAt) : "—"}</div>}
                    {selected.flags?.rapidTransactionFlag && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#a78bfa" }}>● Rapid ({selected.flags.rapidTransactionCount}x) · Exp {selected.flags.rapidFlagExpiresAt ? fmt.time(selected.flags.rapidFlagExpiresAt) : "—"}</div>}
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>90K+ count: {selected.flags?.highAmountCount || 0}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: selected.flags?.adminReviewed ? "#22c55e" : "#f59e0b" }}>
                      Reviewed: {selected.flags?.adminReviewed ? "Yes ✓" : "No ●"}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Recent Transactions</div>
                  {(selected.recentTransactions || []).map((tx, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{fmt.ago(tx.timestamp)}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: "#22c55e" }}>+{fmt.naira(tx.amount)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Btn variant="success" full onClick={() => setClearModal(true)} disabled={actionLoading}>Clear Flags</Btn>
                  <Btn variant="ghost"   full onClick={() => setNoteModal(true)}  disabled={actionLoading}>Add Note</Btn>
                  <Btn variant="danger"  full onClick={handleSuspend}             disabled={actionLoading}>
                    {actionLoading ? "Processing…" : "Suspend User"}
                  </Btn>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      <Modal open={clearModal} onClose={() => setClearModal(false)} title="Clear Security Flags" width={380}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 18px" }}>
          Clear all security flags for <strong style={{ color: "#e2e8f0" }}>{selected?.name}</strong>? This will unblock their transactions. This action is logged with your admin ID.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="success" full onClick={handleClearFlags} disabled={actionLoading}>{actionLoading ? "Clearing…" : "Confirm Clear"}</Btn>
          <Btn variant="ghost" onClick={() => setClearModal(false)}>Cancel</Btn>
        </div>
      </Modal>

      <Modal open={noteModal} onClose={() => setNoteModal(false)} title={`Admin Note · ${selected?.name}`} width={400}>
        <Input label="Note" value={noteText} onChange={setNoteText} placeholder="Security context, action taken, observations…" textarea />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Btn variant="primary" full onClick={handleNote} disabled={actionLoading}>{actionLoading ? "Saving…" : "Save Note"}</Btn>
          <Btn variant="ghost" onClick={() => setNoteModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}