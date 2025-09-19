"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export type SidebarItem = {
  key: string;
  label: string;
  count?: number;
};

export default function Sidebar({
  items,
  value,
  onChange,
  title = "Categories",
}: {
  items: SidebarItem[];
  value: string;
  onChange: (key: string) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <aside className="lg:w-64">
      {/* Mobile toggle */}
      <div className="mb-4 lg:hidden">
        <button
          className="w-full rounded-xl border bg-white px-4 py-2 text-sm text-text-hi shadow-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {title}
        </button>
      </div>

      <div className="hidden lg:block sticky top-20">
        <CategoryList items={items} value={value} onChange={onChange} title={title} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="lg:hidden rounded-2xl border bg-white p-3 shadow-soft-1"
          >
            <CategoryList items={items} value={value} onChange={(k) => { onChange(k); setOpen(false); }} title={title} />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function CategoryList({
  items,
  value,
  onChange,
  title,
}: {
  items: SidebarItem[];
  value: string;
  onChange: (key: string) => void;
  title?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-body/70">{title}</p>
      <ul className="space-y-1.5">
        {items.map((it) => {
          const active = value === it.key;
          return (
            <li key={it.key}>
              <button
                onClick={() => onChange(it.key)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                  active
                    ? "bg-accent-1/10 text-text-hi ring-1 ring-accent-1/20"
                    : "hover:bg-surface text-text-body"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {it.label}
                  {typeof it.count === "number" && (
                    <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] text-text-body/70">
                      {it.count}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}