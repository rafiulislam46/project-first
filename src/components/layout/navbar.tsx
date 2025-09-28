"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getClientSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const supabase = getClientSupabase();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Manage local user state using Supabase auth
  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setCredits(null);
      return;
    }
    let mounted = true;
    fetch("/api/user/credits", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setCredits(typeof d.credits === "number" ? d.credits : 0);
      })
      .catch(() => setCredits(0));
    return () => {
      mounted = false;
    };
  }, [user]);

  const displayCredits = useMemo(() => {
    if (credits === null) return "";
    return credits === -1 ? "∞" : String(credits);
  }, [credits]);

  const onLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 flex h-14 items-center">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link href={"/" as Route} className="flex items-center gap-2">
            <span className="text-indigo-600 font-semibold">AIProductStudio</span>
          </Link>
        </div>

        {/* Center: primary nav (desktop) */}
        <nav className="hidden md:flex items-center gap-6 mx-8">
          <Link href={"/" as Route} className="text-sm text-slate-700 hover:text-slate-900">
            Home
          </Link>
          <Link href={"/generator" as Route} className="text-sm text-slate-700 hover:text-slate-900">
            AI Tool
          </Link>
          <Link href={"/pricing" as Route} className="text-sm text-slate-700 hover:text-slate-900">
            Pricing
          </Link>
        </nav>

        {/* Right: actions */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={"/upload" as Route}>Upload Product</Link>
          </Button>
          {!user ? (
            <Button asChild className="rounded-xl btn-gradient">
              <Link href={"/signin" as Route}>Login</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={"/dashboard" as Route}>Dashboard</Link>
              </Button>
              <Button onClick={onLogout} variant="outline" className="rounded-xl">
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <Link href={"/upload" as Route} className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm">
            Upload
          </Link>
          <button
            aria-label="Open menu"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-text-hi shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/30"
            )}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t bg-white/95 backdrop-blur-md"
          >
            <div className="container py-3">
              <div className="flex flex-col gap-1">
                {[
                  { href: "/", label: "Home" },
                  { href: "/generator", label: "AI Tool" },
                  { href: "/test-prompts", label: "AI Product" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/upload", label: "Upload Product" },
                  { href: user ? "/dashboard" : "/signin", label: user ? "Dashboard" : "Login" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className="rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {user && (
                  <div className="mt-3 rounded-xl border bg-white h-9 px-3 inline-flex items-center text-sm text-text-body">
                    Credits: {displayCredits || "…"}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}