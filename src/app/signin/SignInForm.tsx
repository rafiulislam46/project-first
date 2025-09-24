"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

export default function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<"idle" | "signin" | "signup">("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const disabled = useMemo<boolean>(() => loading !== "idle", [loading]);

  const onSignIn = useCallback(async (): Promise<void> => {
    setError("");
    setMessage("");
    setLoading("signin");

    // Placeholder for Supabase sign-in:
    // const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    // if (err) { setError(err.message); } else { ... }

    // Simulate successful sign-in for now
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessage("Signed in successfully.");

    const redirectedFrom = search.get("redirectedFrom");
    router.replace((redirectedFrom || "/dashboard") as Route);

    setLoading("idle");
  }, [email, password, router, search]);

  const onSignUp = useCallback(async (): Promise<void> => {
    setError("");
    setMessage("");
    setLoading("signup");

    // Placeholder for Supabase sign-up:
    // const { data, error: err } = await supabase.auth.signUp({ email, password });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessage("Sign up successful.");

    setLoading("idle");
  }, [email, password]);

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm text-text-body">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm text-text-body">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
        />
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

      <div className="flex items-center gap-3">
        <button
          onClick={onSignIn}
          disabled={disabled || !email || !password}
          className="inline-flex items-center rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading === "signin" ? "Signing in..." : "Sign In"}
        </button>
        <button
          onClick={onSignUp}
          disabled={disabled || !email || !password}
          className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-text hover:bg-white/5 disabled:opacity-50"
        >
          {loading === "signup" ? "Signing up..." : "Sign Up"}
        </button>
      </div>

      <p className="text-text-body text-sm">
        {"Don't have an account?"}{" "}
        <Link href={"/signup" as Route} className="text-accent-1 underline underline-offset-4">
          Create one
        </Link>
        .
      </p>
    </>
  );
}