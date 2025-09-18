"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-text-hi font-semibold">AI Product</span>
          <span className="text-text-body/70">Studio</span>
        </Link>
        <nav className="flex items-center gap-1">
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
          <Link href="/result" className="ml-2 hidden rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi sm:inline-block">
            Result
          </Link>
          <a href="https://github.com" className="btn-gradient ml-3">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}