"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cn } from "@/lib/utils";
import { listSaved, removeFavorite, type SavedItem } from "@/lib/store";
import { getCredits } from "@/lib/credits";
import Link from "next/link";
import type { Route } from "next";

export default function DashboardPage() {
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [saved, c] = await Promise.all([listSaved(), getCredits()]);
      if (!active) return;
      setItems(saved);
      setCredits(c);
    })();
    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => (items ? items.length : 0), [items]);

  const onRemove = async (id: string) => {
    setRemoving(id);
    try {
      await removeFavorite(id);
      setItems((prev) => (prev || []).filter((i) => i.id !== id));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Dashboard
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          View your saved images and usage. Upgrade anytime to increase your credits.
        </motion.p>

        {/* Usage/credits */}
        <motion.div className="mb-6 grid gap-4 md:grid-cols-3" variants={fadeUp}>
          <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <p className="text-xs text-text-body/70">Saved items</p>
            <p className="text-2xl font-semibold text-text-hi">{total}</p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <p className="text-xs text-text-body/70">Credits</p>
            <p className="text-2xl font-semibold text-text-hi">
              {credits === null ? "…" : credits === -1 ? "∞" : credits}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <p className="text-xs text-text-body/70">Actions</p>
            <Link href={"/pricing" as Route} className="inline-flex rounded-xl btn-gradient px-3 py-2 text-white text-sm mt-2">
              Upgrade plan
            </Link>
          </div>
        </motion.div>

        {/* Saved items grid */}
        <motion.div className="glass-card p-6" variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="">Saved images</h3>
            <span className="text-xs text-text-body/70">{total} items</span>
          </div>

          {!items && <div className="text-text-body">Loading…</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(items || []).map((it) => (
              <div key={it.id} className="group relative overflow-hidden rounded-2xl border bg-white">
                <div className="relative aspect-[4/5] w-full">
                  <img src={it.src} alt={it.id} className="h-full w-full object-cover" />
                </div>
                <div className="p-3 flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] ring-1",
                    it.kind === "tryon"
                      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  )}>
                    {it.kind}
                  </span>
                  <button
                    className="ml-auto text-xs text-red-500 hover:text-red-600 underline underline-offset-2 disabled:opacity-60"
                    onClick={() => onRemove(it.id)}
                    disabled={removing === it.id}
                  >
                    {removing === it.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items && items.length === 0 && (
            <div className="text-text-body">No saved items yet. Generate images and star your favorites.</div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}