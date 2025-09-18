"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/templates", label: "Templates" },
  { href: "/models", label: "Mockups" },
  { href: "/pricing", label: "Pricing" },
  { href: "/upload", label: "Upload" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-text-hi font-semibold">AI Product</span>
          <span className="text-text-body/70">Studio</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
          <Link href="/result" className="ml-2 rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi">
            Result
          </Link>

          {/* Auth actions (desktop) */}
          <div className="ml-3 flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-xl hover:-translate-y-0.5 transition-transform">
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild className="btn-gradient rounded-xl hover:-translate-y-0.5 transition-transform">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-2">
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

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t bg-white/90 backdrop-blur-md"
          >
            <div className="container py-3">
              <div className="flex flex-col gap-1">
                {nav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm transition-colors",
                        active ? "text-text-hi bg-surface" : "text-text-body hover:text-text-hi"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/result"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi"
                >
                  Result
                </Link>

                {/* Auth actions (mobile) */}
                <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                  <Link href="/signin" onClick={() => setOpen(false)} className="w-full">
                    <div className="w-full inline-flex items-center justify-center rounded-xl border bg-transparent text-sm font-medium text-text-hi hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/40 h-10 transition">
                      Sign in
                    </div>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="w-full">
                    <div className="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium btn-gradient h-10 transition-transform hover:-translate-y-0.5">
                      Sign up
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}