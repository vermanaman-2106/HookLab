"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "oauth") {
      setError("Google sign-in didn’t complete. Try again.");
    } else if (err === "config") {
      setError("Supabase environment variables are missing.");
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        setError(err.message);
        return;
      }
      const next = searchParams.get("next") || "/app";
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setOauthLoading(true);
    try {
      const next = searchParams.get("next") || "/app";
      const { error: err } = await signInWithGoogle(next);
      if (err) {
        setError(err.message ?? "Could not start Google sign-in.");
      }
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0b0b0f] px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#1f1f26] bg-[#111116] p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)]">
        <p className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-transparent">
          HookLab AI
        </p>
        <h1 className="mt-3 text-center text-2xl font-semibold text-white">
          Sign in
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in with Google or email.
        </p>

        <div className="mt-8 space-y-6">
          <GoogleSignInButton
            loading={oauthLoading}
            disabled={loading || !isSupabaseConfigured}
            onClick={handleGoogle}
          />
          {!isSupabaseConfigured ? (
            <p className="text-center text-xs text-amber-200/80">
              Add Supabase keys in <code className="text-gray-400">.env.local</code>{" "}
              to enable Google.
            </p>
          ) : null}

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2a32] to-transparent" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-600">
              or
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2a2a32] to-transparent" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-gray-400"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#1f1f26] bg-[#0b0b0f] px-4 py-3 text-[15px] text-white placeholder:text-gray-600 focus:border-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-gray-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#1f1f26] bg-[#0b0b0f] px-4 py-3 text-[15px] text-white placeholder:text-gray-600 focus:border-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(249,115,22,0.45)] transition-all hover:brightness-105 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-orange-400 hover:text-orange-300"
          >
            Sign up
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#0b0b0f] text-gray-500">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
