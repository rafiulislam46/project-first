"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Category = {
  key: string;
  label: string;
  children?: { key: string; label: string; href: string }[];
};

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/models", label: "Models" },
  { href: "/templates", label: "Templates" },
  { href: "/generator", label: "Generator" },
];

const CATEGORIES: Category[] = [
  {
    key: "categories",
    label: "Categories",
    children: [
      { key: "tshirt", label: "T-shirt", href: "/models?tshirt=1" },
      { key: "hoodie", label: "Hoodie", href: "/models?hoodie=1" },
      { key: "jacket", label: "Jacket", href: "/models?jacket=1" },
      { key: "accessories", label: "Accessories", href: "/models?accessories=1" },
      { key: "home", label: "Home & Living", href: "/models?home=1" },
    ],
  },
];

export default function LeftSidebar() {
  const [openCat, setOpenCat] = useState<string | null>("categories");

  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 shrink-0 flex-col border-r bg-white/80 backdrop-blur-md sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
      <div className="h-14 px-4 flex items-center">
        <Link href={"/" as Route} className="flex items-center gap-2">
          <span className="text-text-hi font-semibold">Mockey</span>
          <span className="text-text-body/70">Clone</span>
        </Link>
      </div>

      <div className="px-3 pb-4">
        <nav className="mt-2 mb-4 space-y-1">
          {NAV_LINKS.map((l) => {
            const href = l.href as string;
            return (
              <Link
                key={l.href}
                href={href as Route}
                className="block rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi hover:bg-surface transition"
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border bg-white p-3 shadow-soft-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-body/70">
            Categories
          </p>
          <ul className="space-y-1.5">
            {CATEGORIES.map((c) => {
              const expanded = openCat === c.key;
              return (
                <li key={c.key}>
                  <button
                    onClick={() => setOpenCat(expanded ? null : c.key)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm transition flex items-center justify-between",
                      expanded ? "bg-accent-1/5 text-text-hi ring-1 ring-accent-1/20" : "hover:bg-surface text-text-body"
                    )}
                  >
                    <span>{c.label}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      className={cn("transition-transform", expanded ? "rotate-180" : "")}
                      fill="none"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-2 mt-1 space-y-1 overflow-hidden"
                      >
                        {c.children?.map((sc) => {
                          const href = sc.href as string;
                          return (
                            <li key={sc.key}>
                              <Link
                                href={href as Route}
                                className="block rounded-xl px-3 py-2 text-sm text-text-body hover:text-text-hi hover:bg-surface"
                              >
                                {sc.label}
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}