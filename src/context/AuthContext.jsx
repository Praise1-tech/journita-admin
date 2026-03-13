/**
 * context/AuthContext.jsx
 * Handles auth state: token, admin, login, logout
 * Reads from / writes to localStorage on mount and change
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const AUTH_KEY  = "journita_admin_token";
const ADMIN_KEY = "journita_admin_user";
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_KEY) || "");
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ADMIN_KEY) || "null"); }
    catch { return null; }
  });

  const isAuthed = !!token;
  const timerRef = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken("");
    setAdmin(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { handleLogout(); }, INACTIVITY_LIMIT);
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthed) return;
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const handleActivity = () => resetTimer();
    events.forEach(e => window.addEventListener(e, handleActivity));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthed, resetTimer]);

  const handleLogin = useCallback((tok, adminData) => {
    localStorage.setItem(AUTH_KEY,  tok);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setToken(tok);
    setAdmin(adminData);
  }, []);

  /** Check if current admin has a specific permission */
  const hasPermission = useCallback((permission) => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;
    return admin.permissions?.[permission] === true;
  }, [admin]);

  /** Check if current admin has a specific role */
  const hasRole = useCallback((...roles) => {
    if (!admin) return false;
    return roles.includes(admin.role);
  }, [admin]);

  return (
    <AuthContext.Provider value={{
      token, admin, isAuthed,
      handleLogin, handleLogout,
      hasPermission, hasRole,
      AUTH_KEY,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);