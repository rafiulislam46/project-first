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
    // Navbar will update immediately via onAuthStateChange
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 flex h-14 items-center">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link href={"/" as Route} className="flex items-center gap-2">
            <span className="text-text-hi font-semibold">Mockey</span>
            <span className="text-text-body/70">Clone</span>
          </Link>
        </div>

        {/* Mobile: right-side action buttons */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <Link
            href={"/pricing" as Route}
            className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm"
          >
            Pricing
          </Link>

          {!user ? (
            <>
              <Link
                href={"/signin" as Route}
                className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm"
              >
                Sign In
              </Link>
              <Link
                href={"/signup" as Route}
                className="inline-flex items-center rounded-xl btn-gradient text-white h-9 px-3 text-sm"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href={"/dashboard" as Route}
                className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm"
              >
                My Profile
              </Link>
              <button
                onClick={onLogout}
                className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm"
              >
                Log out
              </button>
            </>
          )}

          {/* Mobile hamburger */}
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

        {/* Desktop: right-side buttons */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link
            href={"/pricing" as Route}
            className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm"
          >
            Pricing
          </Link>
          {!user ? (
            <>
              <Button asChild variant="outline" className="rounded-xl hover:-translate-y-0.5 transition-transform">
                <Link href={"/signin" as Route}>Sign In</Link>
              </Button>
              <Button asChild className="btn-gradient rounded-xl hover:-translate-y-0.5 transition-transform">
                <Link href={"/signup" as Route}>Sign Up</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="rounded-xl hover:-translate-y-0.5 transition-transform">
                <Link href={"/dashboard" as Route}>My Profile</Link>
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="rounded-xl hover:-translate-y-0.5 transition-transform"
              >
                Log out
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer menu: sections for Home, Models, Templates, Generator, Categories */}
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
                {/* Primary sections */}
                {[
                  { href: "/", label: "Home" },
                  { href: "/models", label: "Models" },
                  { href: "/templates", label: "Templates" },
                  { href: "/generator", label: "Generator" },
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

                {/* Categories group */}
                <div className="mt-2 pt-2 border-t">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-body/70">Categories</p>
                  <div className="flex flex-col gap-1">
                    {[
                      { href: "/models?tshirt=1", label: "T-shirt" },
                      { href: "/models?hoodie=1", label: "Hoodie" },
                      { href: "/models?jacket=1", label: "Jacket" },
                      { href: "/models?accessories=1", label: "Accessories" },
                      { href: "/models?home=1", label: "Home & Living" },
                    ].map((c) => (
                      <Link
                        key={c.href}
                        href={c.href as Route}
                        className="rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi"
                        onClick={() => setOpen(false)}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Logged-in only: credits indicator (non-interactive) */}
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