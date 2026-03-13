import { useState, useEffect, useContext } from "react";
import { RouterCtx } from "../App";
import { ROUTES, BOOKING_TYPE_META, TX_TYPE_META, fmt, apiFetch } from "../lib";
import Card     from "../component/ui/card";
import StatCard from "../component/ui/StatCard";
import Badge    from "../component/ui/Badge";
import Btn      from "../component/ui/Btn";
import Avatar   from "../component/ui/Avatar";
import Modal    from "../component/ui/Modal";
import Input    from "../component/ui/Input";

export default function UserDetail({ user: initialUser }) {
  const { navigate, showToast } = useContext(RouterCtx);
  const [user,           setUser]           = useState(initialUser);
  const [userTx,         setUserTx]         = useState([]);
  const [userBk,         setUserBk]         = useState([]);
  const [txLoading,      setTxLoading]      = useState(true);
  const [bonusModal,     setBonusModal]     = useState(false);
  const [suspendModal,   setSuspendModal]   = useState(false);
  const [bonusForm,      setBonusForm]      = useState({ type: "give", amount: "", reason: "" });
  const [bonusErrors,    setBonusErrors]    = useState({});
  const [bonusLoading,   setBonusLoading]   = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);

  useEffect(() => {
    if (!initialUser?._id) return;
    (async () => {
      setTxLoading(true);
      const [tRes, bRes] = await Promise.all([
        apiFetch(`/users/${initialUser._id}/transactions?limit=10`),
        apiFetch(`/users/${initialUser._id}/bookings?limit=10`),
      ]);
      if (tRes.ok) setUserTx(tRes.data.transactions || tRes.data.data || []);
      if (bRes.ok) setUserBk(bRes.data.bookings    || bRes.data.data || []);
      setTxLoading(false);
    })();
  }, [initialUser?._id]);

  const handleBonus = async () => {
    const errs = {};
    const amt  = parseFloat((bonusForm.amount || "").replace(/,/g, ""));
    if (!bonusForm.amount || isNaN(amt) || amt <= 0) errs.amount = "Enter a valid amount";
    if (!bonusForm.reason.trim())                    errs.reason = "Reason is required";
    if (Object.keys(errs).length) { setBonusErrors(errs); return; }
    setBonusLoading(true);
    const endpoint = bonusForm.type === "give" ? "/bonus/give" : "/bonus/remove";
    const { ok, data } = await apiFetch(endpoint, {
      method: "POST", body: JSON.stringify({ userId: user._id, amount: amt, reason: bonusForm.reason }),
    });
    setBonusLoading(false);
    if (!ok) { showToast(data.message || "Bonus operation failed", "error"); return; }
    const newBonus = bonusForm.type === "give"
      ? (user.wallet.balance.bonus || 0) + amt
      : Math.max(0, (user.wallet.balance.bonus || 0) - amt);
    setUser(u => ({ ...u, wallet: { ...u.wallet, balance: { ...u.wallet.balance, bonus: newBonus } } }));
    showToast(`${bonusForm.type === "give" ? "✓ Gave" : "✓ Removed"} ${fmt.naira(amt)} bonus — ${user.name}`, "success");
    setBonusModal(false); setBonusForm({ type: "give", amount: "", reason: "" }); setBonusErrors({});
  };

  const handleSuspend = async () => {
    const next = user.status === "active" ? "suspended" : "active";
    setSuspendLoading(true);
    const { ok, data } = await apiFetch(`/users/${user._id}/status`, {
      method: "PATCH", body: JSON.stringify({ status: next }),
    });
    setSuspendLoading(false);
    if (!ok) { showToast(data.message || "Action failed", "error"); return; }
    setUser(u => ({ ...u, status: next }));
    showToast(`${user.name} ${next === "suspended" ? "suspended" : "reactivated"}`, next === "suspended" ? "error" : "success");
    setSuspendModal(false);
  };

  return (
    <div>
      <button onClick={() => navigate(ROUTES.USERS)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontFamily: "'Inter', sans-serif", fontSize: 12, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 5, marginBottom: 18 }}>
        ← Back to Users
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name={user.name} size={46} />
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 900, color: "#e2e8f0", margin: 0 }}>{user.name}</h1>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569", marginTop: 3 }}>{user.email} · {user.phone}</div>
            <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
              <Badge variant={user.status}>{user.status}</Badge>
              <Badge variant={user.wallet.accountStatus === "active" ? "active" : user.wallet.accountStatus === "in_debt" ? "in_debt" : "suspended"}>{user.wallet.accountStatus}</Badge>
              <Badge variant="default">KYC Tier {user.kyc.tier}</Badge>
              <Badge variant="default">Joined {fmt.date(user.createdAt)}</Badge>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="amber" size="sm" onClick={() => setBonusModal(true)}>◉ Manage Bonus</Btn>
          <Btn variant={user.status === "active" ? "danger" : "success"} size="sm" onClick={() => setSuspendModal(true)}>
            {user.status === "active" ? "Suspend" : "Reactivate"}
          </Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Available Balance" value={fmt.naira(user.wallet.balance.available)} />
        <StatCard label="Bonus Balance"     value={fmt.naira(user.wallet.balance.bonus)} accent />
        <StatCard label="Debt Amount"       value={fmt.naira(user.wallet.debt.amount)} sub={user.wallet.debt.reason || "No debt"} />
        <StatCard label="Total Bookings"    value={user.bookingStats.totalBookings} sub="All time" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 18 }}>
        {Object.entries(user.bookingStats.bookingsByType).map(([type, count]) => {
          const m = BOOKING_TYPE_META[type] || { icon: "◆", label: type, color: "#94a3b8" };
          return (
            <div key={type} style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: m.color, fontWeight: 900 }}>{count}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.icon} {m.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title={`Transactions (${userTx.length})`} noPad>
          {txLoading ? (
            <div style={{ padding: 36, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569" }}>Loading…</div>
          ) : userTx.length === 0 ? (
            <div style={{ padding: 36, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#334155" }}>No transactions</div>
          ) : userTx.map(tx => {
            const m = TX_TYPE_META[tx.type] || {};
            return (
              <div key={tx._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: m.color }}>◆</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8" }}>{tx.description}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", marginTop: 2 }}>{fmt.ago(tx.timestamp)} · {tx.provider}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: tx.amount < 0 ? "#ef4444" : "#22c55e" }}>
                    {tx.amount < 0 ? `−${fmt.naira(Math.abs(tx.amount))}` : fmt.naira(tx.amount)}
                  </div>
                  <div style={{ marginTop: 3 }}><Badge variant={tx.status} small>{tx.status}</Badge></div>
                </div>
              </div>
            );
          })}
        </Card>

        <Card title={`Bookings (${userBk.length})`} noPad>
          {txLoading ? (
            <div style={{ padding: 36, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#475569" }}>Loading…</div>
          ) : userBk.length === 0 ? (
            <div style={{ padding: 36, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#334155" }}>No bookings</div>
          ) : userBk.map(bk => {
            const m      = BOOKING_TYPE_META[bk.type] || { icon: "◆", label: bk.type, color: "#94a3b8" };
            const detail = bk.type === "flight" ? bk.details?.route : bk.type === "ride" ? `${bk.details?.pickup} → ${bk.details?.dropoff}` : bk.type === "esim" ? bk.details?.package : bk.type === "hotel" ? bk.details?.hotel : bk.type;
            return (
              <div key={bk._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, color: m.color, flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8" }}>{detail}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", marginTop: 2 }}>{fmt.ago(bk.createdAt)}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#e2e8f0" }}>{fmt.naira(bk.amount)}</div>
                  <div style={{ marginTop: 3 }}><Badge variant={bk.status} small>{bk.status}</Badge></div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Modal open={bonusModal} onClose={() => { setBonusModal(false); setBonusErrors({}); }} title={`Bonus Management · ${user.name}`}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["give", "remove"].map(t => (
            <button key={t} onClick={() => setBonusForm(f => ({ ...f, type: t }))}
              style={{ flex: 1, padding: "10px 0", border: `1px solid ${bonusForm.type === t ? (t === "give" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.08)"}`, borderRadius: 7, background: bonusForm.type === t ? (t === "give" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)") : "transparent", color: bonusForm.type === t ? (t === "give" ? "#22c55e" : "#ef4444") : "#64748b", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
              {t === "give" ? "+ Give Bonus" : "− Remove Bonus"}
            </button>
          ))}
        </div>
        <div style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", borderRadius: 7, padding: "9px 13px", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#60a5fa" }}>Current bonus balance: {fmt.naira(user.wallet.balance.bonus)}</span>
        </div>
        <Input label="Amount (₦)" value={bonusForm.amount} onChange={v => setBonusForm(f => ({ ...f, amount: v }))} placeholder="e.g. 5000" error={bonusErrors.amount} />
        <Input label="Reason"     value={bonusForm.reason} onChange={v => setBonusForm(f => ({ ...f, reason: v }))} placeholder="Referral reward, compensation, promo…" error={bonusErrors.reason} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <Btn variant={bonusForm.type === "give" ? "success" : "danger"} full onClick={handleBonus} disabled={bonusLoading}>
            {bonusLoading ? "Processing…" : bonusForm.type === "give" ? "Confirm Give Bonus" : "Confirm Remove Bonus"}
          </Btn>
          <Btn variant="ghost" onClick={() => { setBonusModal(false); setBonusErrors({}); }}>Cancel</Btn>
        </div>
        <div style={{ marginTop: 16, padding: "9px 12px", background: "#060a0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>API</div>
          <code style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#60a5fa" }}>
            POST /api/admin/bonus/{bonusForm.type === "give" ? "give" : "remove"}
          </code>
        </div>
      </Modal>

      <Modal open={suspendModal} onClose={() => setSuspendModal(false)} title="Confirm Action" width={360}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 20px" }}>
          {user.status === "active"
            ? `Suspend ${user.name}? They will lose all access to Journita services immediately.`
            : `Reactivate ${user.name}? Full access will be restored.`}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant={user.status === "active" ? "danger" : "success"} full onClick={handleSuspend} disabled={suspendLoading}>
            {suspendLoading ? "Processing…" : user.status === "active" ? "Yes, Suspend User" : "Yes, Reactivate"}
          </Btn>
          <Btn variant="ghost" onClick={() => setSuspendModal(false)}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}