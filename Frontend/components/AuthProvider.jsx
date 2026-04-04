"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext(null);

const notConfiguredError = {
  message:
    "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Frontend/.env.local and restart the dev server.",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) {
      const id = requestAnimationFrame(() => {
        setSession(null);
        setUser(null);
        setLoading(false);
      });
      return () => cancelAnimationFrame(id);
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const getAccessToken = useCallback(() => session?.access_token ?? null, [session]);

  const signIn = useCallback(
    (email, password) => {
      if (!supabase) {
        return Promise.resolve({ data: null, error: notConfiguredError });
      }
      return supabase.auth.signInWithPassword({ email, password });
    },
    [supabase]
  );

  const signUp = useCallback(
    (email, password) => {
      if (!supabase) {
        return Promise.resolve({ data: null, error: notConfiguredError });
      }
      return supabase.auth.signUp({ email, password });
    },
    [supabase]
  );

  const signOut = useCallback(() => {
    if (!supabase) {
      return Promise.resolve();
    }
    return supabase.auth.signOut();
  }, [supabase]);

  /**
   * Google OAuth (PKCE). Redirects browser to Google, then to /auth/callback.
   * @param {string} [nextPath] — path after login, default /app
   */
  const signInWithGoogle = useCallback(
    async (nextPath = "/app") => {
      if (!supabase) {
        return { data: null, error: notConfiguredError };
      }
      const safe =
        typeof nextPath === "string" && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/app";
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safe)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { data, error };
      }
      if (data?.url && typeof window !== "undefined") {
        window.location.assign(data.url);
      }
      return { data, error: null };
    },
    [supabase]
  );

  const isSupabaseConfigured = supabase != null;

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      getAccessToken,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      supabase,
      isSupabaseConfigured,
    }),
    [
      user,
      session,
      loading,
      getAccessToken,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      supabase,
      isSupabaseConfigured,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
