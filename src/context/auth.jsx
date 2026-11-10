/**
 * Who is signed in.
 *
 * The session itself is an httpOnly cookie the browser holds and this code
 * cannot read — so on load the app asks the server who it is talking to. That
 * one call decides what the whole site shows: the loan pages, the eligible
 * employee list and the two application forms are all gated on it.
 *
 * `status` separates "we have not asked yet" from "asked, nobody is signed
 * in". Without that distinction every page flashes its signed-out state for a
 * moment on refresh.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | signed-in | signed-out
  const [profile, setProfile] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await api.me();
      setProfile(response.data.profile);
      setMustChangePassword(Boolean(response.data.mustChangePassword));
      setIsAdmin(Boolean(response.data.isAdmin));
      setStatus("signed-in");
      return response.data;
    } catch {
      /* 401 is the normal answer for a visitor, not an error worth showing. */
      setProfile(null);
      setMustChangePassword(false);
      setIsAdmin(false);
      setStatus("signed-out");
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (hris, password) => {
    const response = await api.login(hris, password);
    setProfile(response.data.profile);
    setMustChangePassword(Boolean(response.data.mustChangePassword));
    setIsAdmin(Boolean(response.data.isAdmin));
    setStatus("signed-in");
    return response;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setProfile(null);
      setMustChangePassword(false);
      setIsAdmin(false);
      setStatus("signed-out");
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      loading: status === "loading",
      isSignedIn: status === "signed-in",
      profile,
      isAdmin,
      mustChangePassword,
      signIn,
      signOut,
      refresh,
      setMustChangePassword,
    }),
    [status, profile, isAdmin, mustChangePassword, signIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
