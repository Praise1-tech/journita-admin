/**
 * pages/AdminManager.jsx
 * Super Admin only — create and manage admin accounts
 */

import { useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { RouterCtx } from "../App";

const API = "/api/auth/admin";

const ROLE_COLORS = {
  super_admin: { bg: "rgba(245,166,35,0.12)", text: "#F5A623", border: "rgba(245,166,35,0.3)" },
  admin:       { bg: "rgba(99,102,241,0.12)",  text: "#818cf8", border: "rgba(99,102,241,0.3)" },
  support:     { bg: "rgba(34,197,94,0.12)",   text: "#22c55e", border: "rgba(34,197,94,0.3)" },
};

const PERMISSION_LABELS = {
  viewUsers: "View Users", viewTransactions: "View Transactions", viewBookings: "View Bookings",
  viewSecurity: "View Security", viewBonus: "View Bonus", viewFeed: "View Feed", viewSettings: "View Settings",
  canDeleteUsers: "Delete Users", canSuspendUsers: "Suspend Users", canGiveBonus: "Give Bonus",
  canModerateFeeds: "Moderate Feed", canSwitchGateway: "Switch Gateway",
};

const ROLE_DEFAULTS = {
  super_admin: Object.fromEntries(Object.keys(PERMISSION_LABELS).map(k => [k, true])),
  admin: { viewUsers: true, viewTransactions: false, viewBookings: true, viewSecurity: false, viewBonus: false, viewFeed: true, viewSettings: false, canDeleteUsers: false, canSuspendUsers: true, canGiveBonus: false, canModerateFeeds: true, canSwitchGateway: false },
  support: { viewUsers: true, viewTransactions: false, viewBookings: true, viewSecurity: false, viewBonus: false, viewFeed: false, viewSettings: false, canDeleteUsers: false, canSuspendUsers: false, canGiveBonus: false, canModerateFeeds: false, canSwitchGateway: false },
};

const emptyForm = { name: "", email: "", password: "", role: "admin", permissions: { ...ROLE_DEFAULTS.admin } };

export default function AdminManager() {
  const { token, admin: currentAdmin } = useAuth();
  const { showToast } = useContext(RouterCtx);
  const [admins,      setAdmins]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const inter = "'Inter', sans-serif";
  const syne  = "'Syne', sans-serif";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/list`, { headers });
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
      else showToast(data.message || "Failed to load admins", "error");
    } catch { showToast("Network error", "error"); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (adm) => {
    setEditTarget(adm.id);
    setForm({ name: adm.name, email: adm.email, password: "", role: adm.role, permissions: { ...adm.permissions } });
    setShowForm(true);
  };
  const handleRoleChange = (role) => setForm(f => ({ ...f, role, permissions: { ...ROLE_DEFAULTS[role] } }));
  const togglePerm = (key) => setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) return showToast("Name and email are required", "error");
    if (!editTarget && !form.password.trim()) return showToast("Password is required for new admins", "error");
    if (form.password && form.password.length < 8) return showToast("Password must be at least 8 characters", "error");
    setSubmitting(true);
    try {
      const isEdit = !!editTarget;
      const url    = isEdit ? `${API}/${editTarget}` : `${API}/create`;
      const method = isEdit ? "PATCH" : "POST";
      const body = { name: form.name, email: form.email, role: form.role, permissions: form.permissions };
      if (!isEdit || form.password) body.password = form.password;
      const res  = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { showToast(isEdit ? "Admin updated" : "Admin created successfully", "success"); setShowForm(false); fetchAdmins(); }
      else showToast(data.message || "Failed", "error");
    } catch { showToast("Network error", "error"); } finally { setSubmitting(false); }
  };

  const toggleStatus = async (adm) => {
    const newStatus = adm.status === "active" ? "inactive" : "active";
    try {
      const res  = await fetch(`${API}/${adm.id}`, { method: "PATCH", headers, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (data.success) { showToast(`Admin ${newStatus === "active" ? "activated" : "deactivated"}`, "success"); fetchAdmins(); }
      else showToast(data.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const res  = await fetch(`${API}/${deleteModal.id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (data.success) { showToast("Admin deleted", "success"); setDeleteModal(null); fetchAdmins(); }
      else showToast(data.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
  };

  const isSelf = (adm) => adm.id === currentAdmin?.id;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 900, color: "#e2e8f0", margin: 0, letterSpacing: "-0.02em" }}>Admin Accounts</h2>
          <p style={{ fontFamily: inter, fontSize: 12, color: "#475569", margin: "4px 0 0" }}>Manage who has access to this console and what they can see</p>
        </div>
        <button onClick={openCreate} style={{ background: "#2563EB", border: "none", borderRadius: 8, padding: "10px 18px", fontFamily: inter, fontSize: 12, fontWeight: 700, color: "#ffffff", cursor: "pointer", flexShrink: 0 }}>
          + New Admin
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, fontFamily: inter, fontSize: 12, color: "#475569" }}>Loading…</div>
      ) : admins.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, fontFamily: inter, fontSize: 12, color: "#475569" }}>No admins found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {admins.map(adm => {
            const rc = ROLE_COLORS[adm.role] || ROLE_COLORS.admin;
            const self = isSelf(adm);
            return (
              <div key={adm.id} style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", opacity: adm.status === "inactive" ? 0.5 : 1 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: rc.bg, border: `1px solid ${rc.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 14, color: rc.text }}>{adm.name?.charAt(0)?.toUpperCase() || "A"}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>{adm.name}</span>
                    {self && <span style={{ fontFamily: inter, fontSize: 10, color: "#F5A623", background: "rgba(245,166,35,0.1)", padding: "2px 6px", borderRadius: 4 }}>YOU</span>}
                    <span style={{ fontFamily: inter, fontSize: 10, padding: "2px 8px", borderRadius: 4, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{adm.role.replace("_", " ").toUpperCase()}</span>
                    {adm.status === "inactive" && <span style={{ fontFamily: inter, fontSize: 10, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: 4 }}>INACTIVE</span>}
                  </div>
                  <div style={{ fontFamily: inter, fontSize: 12, color: "#475569", marginTop: 3 }}>{adm.email}</div>
                  <div style={{ fontFamily: inter, fontSize: 10, color: "#334155", marginTop: 4 }}>Last login: {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString() : "Never"} · {adm.loginCount || 0} logins</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {Object.entries(adm.permissions || {}).filter(([, v]) => v).map(([k]) => (
                      <span key={k} style={{ fontFamily: inter, fontSize: 9, color: "#64748b", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, padding: "2px 6px" }}>
                        {PERMISSION_LABELS[k] || k}
                      </span>
                    ))}
                  </div>
                </div>
                {!self && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => openEdit(adm)} style={btnStyle("#1e293b", "#e2e8f0", inter)}>Edit</button>
                    <button onClick={() => toggleStatus(adm)} style={btnStyle(adm.status === "active" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", adm.status === "active" ? "#ef4444" : "#22c55e", inter)}>
                      {adm.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    {adm.role !== "super_admin" && (
                      <button onClick={() => setDeleteModal(adm)} style={btnStyle("rgba(239,68,68,0.08)", "#ef4444", inter)}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }} onClick={() => setShowForm(false)}>
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 900, color: "#e2e8f0", margin: "0 0 20px" }}>{editTarget ? "Edit Admin" : "Create New Admin"}</h3>

            <Field label="FULL NAME" inter={inter}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" style={inputStyle(inter)} />
            </Field>
            <Field label="EMAIL" inter={inter}>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@journita.ai" type="email" disabled={!!editTarget} style={{ ...inputStyle(inter), opacity: editTarget ? 0.5 : 1 }} />
            </Field>
            <Field label={editTarget ? "NEW PASSWORD (leave blank to keep)" : "PASSWORD"} inter={inter}>
              <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editTarget ? "Leave blank to keep current" : "Min 8 characters"} type="password" style={inputStyle(inter)} />
            </Field>

            <Field label="ROLE" inter={inter}>
              <div style={{ display: "flex", gap: 8 }}>
                {["admin", "support", "super_admin"].map(r => (
                  <button key={r} onClick={() => handleRoleChange(r)} style={{ flex: 1, padding: "9px 0", background: form.role === r ? ROLE_COLORS[r].bg : "rgba(255,255,255,0.03)", border: `1px solid ${form.role === r ? ROLE_COLORS[r].border : "rgba(255,255,255,0.07)"}`, borderRadius: 7, fontFamily: inter, fontSize: 11, fontWeight: 700, color: form.role === r ? ROLE_COLORS[r].text : "#64748b", cursor: "pointer" }}>
                    {r.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: inter, fontSize: 10, color: "#334155", marginTop: 6 }}>Changing role resets permissions to defaults.</div>
            </Field>

            <Field label="PERMISSIONS" inter={inter}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                  const on = !!form.permissions[key];
                  return (
                    <button key={key} onClick={() => togglePerm(key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: on ? "rgba(37,99,235,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${on ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 6, cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, background: on ? "#2563EB" : "transparent", border: `1.5px solid ${on ? "#2563EB" : "#475569"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {on && <span style={{ fontSize: 9, color: "#ffffff", fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontFamily: inter, fontSize: 11, color: on ? "#e2e8f0" : "#64748b" }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontFamily: inter, fontSize: 12, color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: "11px 0", background: submitting ? "rgba(37,99,235,0.5)" : "#2563EB", border: "none", borderRadius: 8, fontFamily: inter, fontSize: 12, fontWeight: 700, color: "#ffffff", cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }} onClick={() => setDeleteModal(null)}>
          <div style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 900, color: "#e2e8f0", marginBottom: 8 }}>Delete Admin?</div>
            <div style={{ fontFamily: inter, fontSize: 13, color: "#475569", marginBottom: 24, lineHeight: 1.6 }}>
              <span style={{ color: "#F5A623" }}>{deleteModal.name}</span> ({deleteModal.email}) will lose all access immediately. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "10px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontFamily: inter, fontSize: 12, color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "10px 0", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontFamily: inter, fontSize: 12, fontWeight: 700, color: "#ef4444", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, inter }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: inter, fontSize: 10, fontWeight: 600, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = (inter) => ({
  width: "100%", background: "#060a0f", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7, padding: "10px 12px", fontFamily: inter,
  fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box",
});

function btnStyle(bg, color, inter) {
  return { background: bg, border: "none", borderRadius: 6, padding: "7px 12px", fontFamily: inter, fontSize: 11, fontWeight: 600, color, cursor: "pointer" };
}