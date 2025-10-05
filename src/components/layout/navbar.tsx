"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getClientSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const supabase = getClientSupabase();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white text-gray-900 backdrop-blur">
      <div className="max-w-screen-xl mx-auto px-4 flex h-16 items-center">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href={"/" as Route} className="flex items-center gap-2">
            <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold text-lg">
              <span className="text-indigo-600">AI</span>{" "}
              <span className="text-gray-900">Ads</span>
            </span>
          </Link>
        </div>

        {/* Primary nav */}
        <nav className="hidden md:flex items-center gap-8 mx-12">
          {[
            { href: "/", label: "Home" },
            { href: "/ai-tool", label: "AI Tool" },
            { href: "/models", label: "Models" },
            { href: "/templates", label: "Templates" },
            { href: "/pricing", label: "Pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "text-sm font-medium",
                isActive(item.href) ? "text-indigo-600" : "text-gray-700 hover:text-gray-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            href={"/signup" as Route}
            className="inline-flex items-center px-4 h-10 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-500"
          >
            Free Trial
          </Link>
          {!user ? (
            <Link
              href={"/signin" as Route}
              className="inline-flex items-center px-4 h-10 rounded-full bg-white border text-gray-900 text-sm font-semibold hover:bg-slate-50"
            >
              Sign in
            </Link>
          ) : (
            <>
              <Link
                href={"/dashboard" as Route}
                className="inline-flex items-center px-4 h-10 rounded-full bg-white border text-gray-900 text-sm font-semibold hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Button
                onClick={onLogout}
                variant="outline"
                className="rounded-full bg-white border text-gray-900 text-sm font-semibold hover:bg-slate-50"
              >
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <button
            aria-label="Open menu"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500 bg-white text-indigo-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
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
            className="md:hidden overflow-hidden border-t border-gray-200 bg-white"
          >
            <div className="container py-3">
              <div className="flex flex-col gap-1">
                {[
                  { href: "/", label: "Home" },
                  { href: "/generator", label: "AI Tools" },
                  { href: "/models", label: "Models" },
                  { href: "/templates", label: "Templates" },
                  { href: "/pricing", label: "Pricing" },
                  { href: user ? "/dashboard" : "/signin", label: user ? "Dashboard" : "Sign in" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm",
                      isActive(item.href) ? "text-indigo-600 font-medium" : "text-gray-700 hover:text-gray-900"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {user && (
                  <div className="mt-3 rounded-xl border border-indigo-500 bg-white h-9 px-3 inline-flex items-center text-sm text-indigo-700">
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