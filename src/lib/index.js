import { useState, useEffect } from "react";

// ── Routes ────────────────────────────────────────────────────────────────────
export const ROUTES = {
  DASHBOARD:    "dashboard",
  USERS:        "users",
  USER_DETAIL:  "user_detail",
  TRANSACTIONS: "transactions",
  BOOKINGS:     "bookings",
  BONUS:        "bonus",
  SECURITY:     "security",
  FEED:         "feed",  
  SETTINGS:     "settings",
};

// ── Transaction type metadata ─────────────────────────────────────────────────
export const TX_TYPE_META = {
  deposit:        { label: "Deposit",    color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
  ride_payment:   { label: "Ride",       color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  flight_payment: { label: "Flight",     color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
  esim_purchase:  { label: "eSIM",       color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  bonus:          { label: "Bonus",      color: "#F5A623", bg: "rgba(245,166,35,0.08)"  },
  withdrawal:     { label: "Withdrawal", color: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
  refund:         { label: "Refund",     color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
  debt_clearance: { label: "Debt Clear", color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
};

// ── Booking type metadata ─────────────────────────────────────────────────────
export const BOOKING_TYPE_META = {
  flight: { label: "Flight", icon: "✦", color: "#60a5fa" },
  ride:   { label: "Ride",   icon: "◈", color: "#f59e0b" },
  esim:   { label: "eSIM",   icon: "◉", color: "#a78bfa" },
  hotel:  { label: "Hotel",  icon: "⬡", color: "#34d399" },
  food:   { label: "Food",   icon: "◆", color: "#f87171" },
};

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmt = {
  naira:    (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`,
  date:     (d) => new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
  time:     (d) => new Date(d).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
  datetime: (d) => `${fmt.date(d)}, ${fmt.time(d)}`,
  ago: (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60)    return `${s}s ago`;
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  },
  initials: (name) => (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
};

// ── useDebounce hook ──────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Auth & API ────────────────────────────────────────────────────────────────
export const AUTH_KEY  = "journita_admin_token";
export const ADMIN_KEY = "journita_admin_user";
export const IS_DEV    = typeof window !== "undefined" && window.location.hostname === "localhost";
export const API_BASE  = IS_DEV ? "http://localhost:5173/api/admin" : "https://api.journita.ai/api/admin";
export const AUTH_URL  = IS_DEV ? "http://localhost:5173/api/auth/admin" : "https://api.journita.ai/api/auth/admin";
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(AUTH_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (res.status === 401) {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ADMIN_KEY);
    window.location.reload();
  }
  return { ok: res.ok, status: res.status, data };
}