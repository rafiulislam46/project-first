"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";
import { HAS_SUPABASE } from "@/lib/config";
import { getClientSupabase } from "@/lib/supabase";

export default function SignInPage() {
  const supabase = getClientSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"idle" | "signin" | "signup">("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const disabled = useMemo(() => loading !== "idle", [loading]);

  const onSignIn = useCallback(async () => {
    if (!supabase) return;
    setError("");
    setMessage("");
    setLoading("signin");
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      setError(err.message);
    } else {
      // Session should be set and persisted by Supabase
      setMessage(data.session ? "Signed in successfully." : "Check your email to complete sign in.");
    }
    setLoading("idle");
  }, [supabase, email, password]);

  const onSignUp = useCallback(async () => {
    if (!supabase) return;
    setError("");
    setMessage("");
    setLoading("signup");
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // If your Supabase project requires email confirmation, this will send an email.
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}` : undefined,
      },
    });
    if (err) {
      setError(err.message);
    } else {
      if (data.user && !data.session) {
        setMessage("Sign up successful. Please check your email to confirm your account.");
      } else {
        setMessage("Sign up successful.");
      }
    }
    setLoading("idle");
  }, [supabase, email, password]);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Sign in
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          {HAS_SUPABASE
            ? "Welcome back. Sign in with your email and password, or create a new account."
            : "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."}
        </motion.p>

        <motion.div className="glass-card p-6 space-y-6" variants={fadeUp}>
          {HAS_SUPABASE ? (
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
                  className="inline-flex items-center rounded-md bg-accent-1 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
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
                Don't have an account?{" "}
                <Link href={"/signup" as Route} className="text-accent-1 underline underline-offset-4">
                  Create one
                </Link>
                .
              </p>
            </>
          ) : (
            <p className="text-text-body">
              Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth.
            </p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}