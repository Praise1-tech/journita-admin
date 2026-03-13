/**
 * pages/Settings.jsx
 * Admin account settings + Payment Gateway switcher
 */

import { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib";
import { RouterCtx } from "../App";

import PageHeader    from "../component/ui/PageHeader";
import Card          from "../component/ui/card";
import Badge         from "../component/ui/Badge";
import Btn           from "../component/ui/Btn";
import AdminManager  from "./Adminmanager";
import { API_BASE, AUTH_URL } from "../lib/index";
//const API_BASE = "/api";

const fmt = {
  datetime: (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return `${date.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}, ${date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  },
  initials: (name) => (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
};

const GATEWAYS = [
  { id: "paystack",    name: "Paystack",    desc: "Card & bank transfer",       fee: "1.5%",  color: "#00C3FF" },
  { id: "flutterwave", name: "Flutterwave", desc: "Card, bank & mobile money",  fee: "1.4%",  color: "#F5A623" },
  { id: "monnify",     name: "Monnify",     desc: "Bank transfer only (free)",  fee: "0%",    color: "#22c55e" },
];

function FieldRow({ label, value, onChange, type = "text", showToggle, show, onToggle, placeholder, disabled = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ""}
          disabled={disabled}
          style={{
            width: "100%", borderRadius: 7,
            padding: showToggle ? "10px 44px 10px 13px" : "10px 13px",
            fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: disabled ? "#374151" : "#e2e8f0",
            outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
            background: disabled ? "rgba(255,255,255,0.02)" : "#060a0f",
            border: disabled ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.1)",
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = "#2563EB"; }}
          onBlur={e =>  { if (!disabled) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
        />
        {showToggle && (
          <button onClick={onToggle} style={{
            position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#475569",
            fontFamily: "'Inter', sans-serif", fontSize: 9, padding: 0,
          }}>
            {show ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Payment Gateway Card ──────────────────────────────────────────────────────
function GatewayCard() {
  const { showToast } = useContext(RouterCtx);
  const [active,     setActive]     = useState(null);
  const [switchedAt, setSwitchedAt] = useState(null);
  const [switchedBy, setSwitchedBy] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [switching,  setSwitching]  = useState(false);
  const [confirm,    setConfirm]    = useState(null);

  useEffect(() => {
    (async () => {
      const { ok, data } = await apiFetch("/settings/gateway");
      if (ok) {
        setActive(data.gateway.active);
        setSwitchedAt(data.gateway.switchedAt);
        setSwitchedBy(data.gateway.switchedBy);
      }
      setLoading(false);
    })();
  }, []);

  const doSwitch = async (gatewayId) => {
    setSwitching(true);
    setConfirm(null);
    const { ok, data } = await apiFetch("/settings/gateway", {
      method: "POST",
      body: JSON.stringify({ gateway: gatewayId }),
    });
    setSwitching(false);
    if (ok) {
      setActive(gatewayId);
      setSwitchedAt(new Date().toISOString());
      showToast(`Switched to ${GATEWAYS.find(g => g.id === gatewayId)?.name}`, "success");
    } else {
      showToast(data?.error || "Failed to switch gateway", "error");
    }
  };

  if (loading) return (
    <Card title="Payment Gateway">
      <div style={{ padding: "18px 22px", fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>Loading…</div>
    </Card>
  );

  const activeGw = GATEWAYS.find(g => g.id === active);

  return (
    <Card title="Payment Gateway">
      <div style={{ padding: "18px 22px" }}>
        {/* Active banner */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${activeGw?.color || "#F5A623"}33`, borderRadius: 9, marginBottom: 18 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: activeGw?.color || "#F5A623", boxShadow: `0 0 8px ${activeGw?.color || "#F5A623"}88`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#e2e8f0", fontWeight: 700 }}>
              {activeGw?.name || active} <span style={{ color: "#475569", fontWeight: 400 }}>· Active</span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#475569", marginTop: 2 }}>
              {activeGw?.desc} · Fee: {activeGw?.fee}
            </div>
          </div>
          <Badge variant="active">LIVE</Badge>
        </div>

        {switchedAt && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#334155", marginBottom: 14, padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 5 }}>
            Last switched {fmt.datetime(switchedAt)}{switchedBy ? ` by ${switchedBy}` : ""}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
          {GATEWAYS.map(gw => {
            const isActive = gw.id === active;
            const isConfirming = confirm === gw.id;
            return (
              <div key={gw.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 8,
                background: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
                border: isActive ? `1px solid ${gw.color}44` : "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? gw.color : "#1e293b", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: isActive ? "#e2e8f0" : "#64748b", fontWeight: isActive ? 700 : 400 }}>{gw.name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#334155", marginTop: 1 }}>{gw.desc} · {gw.fee} fee</div>
                </div>
                {isActive ? (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: gw.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>Active</span>
                ) : isConfirming ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="danger" onClick={() => doSwitch(gw.id)} disabled={switching}>{switching ? "…" : "Confirm"}</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Btn>
                  </div>
                ) : (
                  <Btn size="sm" variant="ghost" onClick={() => setConfirm(gw.id)} disabled={switching}>Switch</Btn>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14, padding: "10px 13px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", borderRadius: 7 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#94a3b8", lineHeight: 1.7 }}>
            ⚠ Switching takes effect immediately for all new payments. In-flight transactions complete normally on the previous gateway.
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Change Password Card ──────────────────────────────────────────────────────
function ChangePasswordCard() {
  const { token, AUTH_KEY } = useAuth();
  const tok = token || localStorage.getItem(AUTH_KEY);

  const [form,    setForm]    = useState({ current: "", next: "", confirm: "" });
  const [show,    setShow]    = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.current || !form.next || !form.confirm) { setError("All fields are required."); return; }
    if (form.next.length < 8)         { setError("New password must be at least 8 characters."); return; }
    if (form.next !== form.confirm)    { setError("New passwords do not match."); return; }
    if (form.current === form.next)    { setError("New password must differ from current."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to update password.");
      } else {
        setSuccess("Password updated successfully.");
        setForm({ current: "", next: "", confirm: "" });
      }
    } catch {
      setError("Server error. Try again.");
    }
    setLoading(false);
  };

  return (
    <Card title="Change Password">
      <div style={{ padding: "18px 22px" }}>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "9px 13px", marginBottom: 14, fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#ef4444" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 7, padding: "9px 13px", marginBottom: 14, fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#22c55e" }}>
            {success}
          </div>
        )}
        <FieldRow
          label="Current Password" value={form.current}
          onChange={v => setForm(f => ({ ...f, current: v }))}
          showToggle show={show.current} onToggle={() => setShow(s => ({ ...s, current: !s.current }))}
          placeholder="••••••••"
        />
        <FieldRow
          label="New Password" value={form.next}
          onChange={v => setForm(f => ({ ...f, next: v }))}
          showToggle show={show.next} onToggle={() => setShow(s => ({ ...s, next: !s.next }))}
          placeholder="Min 8 characters"
        />
        <FieldRow
          label="Confirm New Password" value={form.confirm}
          onChange={v => setForm(f => ({ ...f, confirm: v }))}
          showToggle show={show.confirm} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
          placeholder="Repeat new password"
        />
        <Btn variant="primary" full onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating…" : "Update Password"}
        </Btn>
      </div>
    </Card>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const { admin, handleLogout, hasRole, hasPermission, AUTH_KEY } = useAuth();
  const token = localStorage.getItem(AUTH_KEY);

  const [profile,     setProfile]     = useState({ name: admin?.name || "", email: admin?.email || "" });
  const [profLoading, setProfLoading] = useState(false);
  const [profMsg,     setProfMsg]     = useState(null);

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) { setProfMsg({ text: "Name cannot be empty", type: "error" }); return; }
    setProfLoading(true); setProfMsg(null);
    try {
      const res = await fetch(`${AUTH_URL}/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfMsg({ text: data.message || "Failed to update profile", type: "error" });
      } else {
        const updated = { ...admin, name: profile.name };
        localStorage.setItem("journita_admin_user", JSON.stringify(updated));
        setProfMsg({ text: "Profile updated successfully", type: "success" });
      }
    } catch {
      setProfMsg({ text: "Server error. Try again.", type: "error" });
    }
    setProfLoading(false);
  };

  const infoRow = (label, value, highlight = false) => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: highlight ? "#22c55e" : "#94a3b8" }}>{value}</span>
    </div>
  );

  return (
    <div>
      <PageHeader title="Settings" sub="Manage your admin account and preferences" />

      {/* ── Main grid — uses responsive class instead of inline style ── */}
      <div className="grid-2col" style={{ maxWidth: 860 }}>

        {/* Profile */}
        <Card title="Profile">
          <div style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, padding: "14px 16px", background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.1)", borderRadius: 9 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#111827", border: "1px solid rgba(37,99,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "#2563EB", fontWeight: 700 }}>
                  {fmt.initials(admin?.name || "SA")}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>{admin?.name || "Admin"}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", marginTop: 2 }}>{admin?.email}</div>
                <div style={{ marginTop: 5 }}><Badge variant="active">{admin?.role || "admin"}</Badge></div>
              </div>
            </div>

            {profMsg && (
              <div style={{ background: profMsg.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${profMsg.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 7, padding: "9px 13px", marginBottom: 14, fontFamily: "'Inter', sans-serif", fontSize: 11, color: profMsg.type === "success" ? "#22c55e" : "#ef4444" }}>
                {profMsg.text}
              </div>
            )}

            <FieldRow label="Display Name" value={profile.name}  onChange={v => setProfile(p => ({ ...p, name: v }))} placeholder="Your name" />
            <FieldRow label="Email"        value={profile.email} onChange={() => {}} disabled />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#334155", marginTop: -10, marginBottom: 14 }}>
              Email cannot be changed here
            </div>
            <Btn variant="primary" full onClick={handleUpdateProfile} disabled={profLoading}>
              {profLoading ? "Saving…" : "Save Profile"}
            </Btn>
          </div>
        </Card>

        {/* Change Password */}
        

        {/* Payment Gateway — only if admin has permission */}
        {hasPermission("canSwitchGateway") && <GatewayCard />}

        {/* Active Session */}
        <Card title="Active Session">
          <div style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 22 }}>
              {infoRow("Signed in as",  admin?.email || "—")}
              {infoRow("Role",          admin?.role  || "admin")}
              {infoRow("Session token", `${(token || "").slice(0, 24)}…`)}
              {infoRow("Last activity", fmt.datetime(new Date()))}
            </div>
            <Btn variant="danger" full onClick={handleLogout}>Sign Out</Btn>
          </div>
        </Card>

        {/* System */}
        <Card title="System">
          <div style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {infoRow("API Base URL",  API_BASE)}
              {infoRow("Panel version", "v1.4.2")}
              {infoRow(
                "Environment",
                typeof window !== "undefined" && window.location.hostname === "localhost" ? "development" : "production",
                typeof window !== "undefined" && window.location.hostname !== "localhost",
              )}
            </div>
            <div style={{ marginTop: 22, padding: "12px 14px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: 8 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Danger Zone</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#475569", lineHeight: 1.6 }}>
                Signing out clears your session token. Re-authentication required to access the panel.
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* ── Admin Manager — super_admin only ── */}
      {hasRole("super_admin") && (
        <div style={{ maxWidth: 860, marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Super Admin Controls
            </span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          </div>
          <AdminManager />
        </div>
      )}

    </div>
  );
}