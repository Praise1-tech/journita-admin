/**
 * pages/Login.jsx
 * Image is an inset rounded card on the left, not edge-to-edge
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AUTH_URL } from "../lib/index";
//const API_BASE   = "/api";
const BLUE       = "#2563EB";
const BLUE_HOVER = "#1d4ed8";

export default function Login() {
  const { handleLogin } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Email and password are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }
      const payload = data.data || data;
      handleLogin(payload.token, payload.admin || payload.user);
    } catch {
      setError("Cannot reach server. Check your connection.");
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          display: flex;
          flex-direction: row;
          min-height: 100vh;
          width: 100%;
          background: #060a0f;
        }

        /* ── Left: background panel, 50% ── */
        .lg-left {
          flex: 0 0 50%;
          display: flex;
          align-items: stretch;
          padding: 20px 28px 20px 20px;
          background: #060a0f;
          min-height: 100vh;
        }

        /* ── The image card — inset with rounded corners ── */
        .lg-hero {
          flex: 1;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 32px;
        }
        .lg-hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
        }
        .lg-hero-overlay {
          position: absolute; inset: 0;
          border-radius: 20px;
          background: linear-gradient(
            to top,
            rgba(6,10,15,0.88) 0%,
            rgba(6,10,15,0.15) 50%,
            rgba(6,10,15,0.25) 100%
          );
        }
        .lg-logo {
          position: absolute; top: 24px; left: 28px; z-index: 3;
        }
        .lg-hero-copy { position: relative; z-index: 2; }
        .lg-hero-copy h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 2.4vw, 32px);
          font-weight: 900; color: #fff;
          line-height: 1.18; letter-spacing: -0.025em;
          margin-bottom: 10px;
        }
        .lg-hero-copy p {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.65; max-width: 280px;
        }

        /* ── Right: dark form panel, 45% ── */
        .lg-panel {
          flex: 0 0 45%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          background: #060a0f;
          min-height: 100vh;
        }
        .lg-inner {
          width: 100%;
          max-width: 340px;
        }

        /* Inputs */
        .lg-input {
          width: 100%;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 11px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s;
        }
        .lg-input:focus { border-color: ${BLUE}; }
        .lg-input::placeholder { color: #2d3f55; }
        .lg-input-pw { padding-right: 54px; }

        .lg-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 500;
          color: #64748b; margin-bottom: 6px;
        }

        /* Mobile ≤ 640px */
        @media (max-width: 640px) {
          .lg-root { flex-direction: column; }
          .lg-left {
            flex: none;
            padding: 16px 16px 0 16px;
            height: 42vh; min-height: 200px; max-height: 300px;
          }
          .lg-hero { border-radius: 16px; padding: 20px 20px 20px 20px; }
          .lg-logo { top: 16px; left: 20px; }
          .lg-hero-copy p { display: none; }
          .lg-panel {
            flex: 1;
            padding: 36px 24px;
            justify-content: flex-start;
            padding-top: 40px;
          }
          .lg-inner { max-width: 100%; }
        }

        @media (max-width: 360px) {
          .lg-left { height: 36vh; min-height: 160px; padding: 12px 12px 0; }
          .lg-hero-copy h2 { font-size: 18px; }
          .lg-panel { padding: 28px 16px; }
        }
      `}</style>

      <div className="lg-root">

        {/* ── Left: padded background + inset image card ── */}
        <div className="lg-left">
          <div className="lg-hero">
            <img className="lg-hero-img" src="/image/img-1.jpg" alt="" />
            <div className="lg-hero-overlay" />
            <div className="lg-logo">
              <img src="/image/logo-1.png" alt="Journita" style={{ height: 26, objectFit: "contain" }} />
            </div>
            <div className="lg-hero-copy">
              <h2>Plan Smarter,<br />Travel Easier</h2>
              <p>Your AI travel companion for flights, rides, hotels and experiences — all in one place.</p>
            </div>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="lg-panel">
          <div className="lg-inner">

            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 900,
              color: "#e2e8f0", marginBottom: 6, letterSpacing: "-0.02em",
            }}>
              Sign in
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              color: "#475569", marginBottom: 28, lineHeight: 1.5,
            }}>
              Restricted access — authorised personnel only
            </p>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 18,
                fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#ef4444",
              }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="lg-label">Email</label>
              <input
                className="lg-input"
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="admin@journita.ai"
                autoComplete="email" autoFocus
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label className="lg-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="lg-input lg-input-pw"
                  type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                    color: "#475569", padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#475569"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Sign In */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? `${BLUE}88` : BLUE,
                border: "none", borderRadius: 8, padding: "13px 0",
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s, transform 0.1s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = BLUE_HOVER; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = BLUE; }}
              onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.985)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? "Authenticating…" : "Sign in"}
            </button>

            <div style={{
              textAlign: "center", marginTop: 32,
              fontFamily: "'Inter', sans-serif", fontSize: 10,
              color: "#334155", letterSpacing: "0.06em",
            }}>
              journita.ai · admin console · v1.4.2
            </div>

          </div>
        </div>

      </div>
    </>
  );
}