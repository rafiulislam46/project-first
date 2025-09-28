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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white text-gray-900 backdrop-blur">
      <div className="max-w-screen-xl mx-auto px-4 flex h-16 items-center">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href={"/" as Route} className="flex items-center gap-2">
            {/* Simple starburst icon to match the reference style */}
            <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-indigo-600 font-semibold text-lg">AIProductStudio</span>
          </Link>
        </div>

        {/* Center: primary nav (desktop) */}
        <nav className="hidden md:flex items-center gap-8 mx-12">
          <Link
            href={"/" as Route}
            className={cn(
              "text-sm font-medium",
              isActive("/") ? "text-indigo-600" : "text-gray-700 hover:text-gray-900"
            )}
          >
            Home
          </Link>
          <Link
            href={"/generator" as Route}
            className={cn(
              "text-sm",
              isActive("/generator") ? "text-indigo-600 font-medium" : "text-gray-700 hover:text-gray-900"
            )}
          >
            AI Tool
          </Link>
          <Link
            href={"/pricing" as Route}
            className={cn(
              "text-sm",
              isActive("/pricing") ? "text-indigo-600 font-medium" : "text-gray-700 hover:text-gray-900"
            )}
          >
            Pricing
          </Link>
        </nav>

        {/* Right: actions */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <Link
            href={"/upload" as Route}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-600 h-10 px-4 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M12 8l-3 3M12 8l3 3M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload Product
          </Link>

          {!user ? (
            <Link
              href={"/signin" as Route}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 20c1.6-3.5 5-5 8-5s6.4 1.5 8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Login
            </Link>
          ) : (
            <>
              <Link
                href={"/dashboard" as Route}
                className="inline-flex items-center rounded-xl border border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-600 h-10 px-4 text-sm"
              >
                Dashboard
              </Link>
              <Button onClick={onLogout} variant="outline" className="rounded-xl border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-600">
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <Link
            href={"/upload" as Route}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500 bg-white text-indigo-700 h-9 px-3 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V8M12 8l-3 3M12 8l3 3M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload
          </Link>
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
                  { href: "/generator", label: "AI Tool" },
                  { href: "/test-prompts", label: "AI Product" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/upload", label: "Upload Product" },
                  { href: user ? "/dashboard" : "/signin", label: user ? "Dashboard" : "Login" },
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