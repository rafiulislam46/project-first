"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getClientSupabase } from "@/lib/supabase-browser";

export default function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = getClientSupabase();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<"idle" | "signin" | "signup">("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const disabled = useMemo<boolean>(() => loading !== "idle", [loading]);

  const onSignIn = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    setError("");
    setMessage("");
    setLoading("signin");

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading("idle");
      return;
    }

    setMessage("Signed in successfully.");
    const redirectedFrom = search.get("redirectedFrom");
    router.replace((redirectedFrom || "/dashboard") as Route);

    setLoading("idle");
  }, [supabase, email, password, router, search]);

  const onSignUp = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    setError("");
    setMessage("");
    setLoading("signup");

    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
    } else {
      setMessage("Sign up successful. Please check your email to confirm.");
    }

    setLoading("idle");
  }, [supabase, email, password]);

  return (
    <>
      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm text-text-body">
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-body/70">
            {/* mail icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M22 8 12 14 2 8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input-premium w-full pl-9"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-text-body">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-body/70">
            {/* lock icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input-premium w-full pl-9"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      {/* Primary action */}
      <div>
        <button
          onClick={onSignIn}
          disabled={disabled || !email || !password}
          className="w-full btn-gradient h-11 text-sm font-semibold disabled:opacity-50"
        >
          {loading === "signin" ? "Logging in..." : "Log In"}
        </button>
      </div>

      {/* Secondary links */}
      <div className="flex items-center justify-between">
        <Link href={"#" as Route} className="text-sm text-indigo-600 hover:underline">
          Forgot password?
        </Link>
        <p className="text-text-body text-sm">
          {"Don't have an account?"}{" "}
          <Link href={"/signup" as Route} className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}