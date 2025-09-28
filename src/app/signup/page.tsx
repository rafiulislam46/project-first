"use client";

import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";
import { HAS_SUPABASE } from "@/lib/config";
import { getClientSupabase } from "@/lib/supabase-browser";

export default function SignUpPage() {
  const supabase = getClientSupabase();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [loading, setLoading] = useState<"idle" | "signup">("idle");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const disabled = useMemo<boolean>(() => loading !== "idle", [loading]);

  const onSignUp = useCallback(async (): Promise<void> => {
    if (!supabase) return;

    // Front-end only validations to match the UI in the mock
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setError("");
    setMessage("");
    setLoading("signup");
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}` : undefined,
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
  }, [supabase, email, password, confirmPassword, agree]);

  return (
    <section className="container min-h-[80vh] flex items-center justify-center py-10 md:py-16">
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="w-full max-w-md"
      >
        <motion.div className="glass-card rounded-2xl p-8 shadow-lg" variants={fadeUp}>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-accent-1">Create Your Account</h2>
            <p className="mt-2 text-sm text-text-body">
              Enter your details to sign up for AI Product Studio.
            </p>
          </div>

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
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="mt-4 space-y-2">
                <label htmlFor="password" className="block text-sm text-text-body">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="mt-4 space-y-2">
                <label htmlFor="confirm" className="block text-sm text-text-body">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="mt-4 flex items-start gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border bg-transparent"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  disabled={disabled}
                />
                <label htmlFor="agree" className="text-sm text-text-body">
                  I agree to the{" "}
                  <Link href={"/terms" as Route} className="text-accent-1 underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href={"/privacy" as Route} className="text-accent-1 underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {error ? (
                <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {message}
                </div>
              ) : null}

              <button
                onClick={onSignUp}
                disabled={
                  disabled || !email || !password || !confirmPassword || password !== confirmPassword || !agree
                }
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500/90 disabled:opacity-50"
              >
                {loading === "signup" ? "Signing up..." : "Sign Up"}
              </button>

              <p className="mt-4 text-center text-sm text-text-body">
                Already have an account?{" "}
                <Link href={"/signin" as Route} className="text-accent-1 underline underline-offset-4">
                  Log In
                </Link>
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