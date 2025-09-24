"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthProvider";
import { getClientSupabase } from "@/lib/supabase-browser";

const CENTER_NAV: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/models", label: "Models" },
  { href: "/templates", label: "Templates" },
  { href: "/generator", label: "Generator" },
  { href: "/pricing", label: "Pricing" }
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const supabase = getClientSupabase();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

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
    // hard refresh to reset auth UI
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 flex h-14 items-center">
        {/* Left: Logo */}
        <div className="flex-1 md:flex-none">
          <Link href={"/" as Route} className="flex items-center gap-2">
            <span className="text-text-hi font-semibold">Mockey</span>
            <span className="text-text-body/70">Clone</span>
          </Link>
        </div>

        {/* Center: main nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-2">
          {CENTER_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "relative rounded-xl px-3 py-2 text-sm text-text-body transition-colors hover:text-text-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/20",
                  active && "text-text-hi"
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-1 -bottom-1 h-0.5 bg-accent-1/60"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: auth */}
        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <>
              <Button asChild variant="outline" className="rounded-xl hover:-translate-y-0.5 transition-transform">
                <Link href={"/signin" as Route}>Log in</Link>
              </Button>
              <Button asChild className="btn-gradient rounded-xl hover:-translate-y-0.5 transition-transform">
                <Link href={"/signup" as Route}>Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                href={"/dashboard" as Route}
                className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm"
              >
                Dashboard
              </Link>
              <div className="inline-flex items-center rounded-xl border bg-white h-9 px-3 text-sm text-text-body">
                Credits: {displayCredits || "…"}
              </div>
              <Button variant="outline" className="rounded-xl" onClick={onLogout}>
                Log out
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden ml-auto flex items-center gap-2">
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

      {/* Mobile sheet */}
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
                {CENTER_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className="rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="mt-2 pt-2 border-t">
                  {/* Auth buttons stack on small screens */}
                  <div className="mt-2 flex flex-col gap-2">
                    {!user ? (
                      <>
                        <Link href={"/signin" as Route} onClick={() => setOpen(false)}>
                          <div className="inline-flex w-full items-center justify-center rounded-xl border bg-white h-10 px-3 text-sm">
                            Login
                          </div>
                        </Link>
                        <Link href={"/signup" as Route} onClick={() => setOpen(false)}>
                          <div className="inline-flex w-full items-center justify-center rounded-xl btn-gradient h-10 px-3 text-sm text-white">
                            Sign up
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href={"/dashboard" as Route} onClick={() => setOpen(false)}>
                          <div className="inline-flex w-full items-center justify-center rounded-xl border bg-white h-10 px-3 text-sm">
                            Dashboard
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            setOpen(false);
                            onLogout();
                          }}
                          className="inline-flex w-full items-center justify-center rounded-xl border bg-white h-10 px-3 text-sm"
                        >
                          Log out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}