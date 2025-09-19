"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cn } from "@/lib/utils";

type Stats = { models: number; templates: number; products: number };
type Product = { id: string; name?: string; imageUrl: string; createdAt: number; updatedAt: number };

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, p] = await Promise.all([
          fetch("/api/admin/stats", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ items: [] })),
        ]);
        if (!active) return;
        setStats(s);
        setProducts((p?.items as Product[]) || []);
      } catch {
        if (!active) {
          /* noop */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
      setProducts((prev) => (prev || []).filter((x) => x.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const productCount = useMemo(() => (products ? products.length : 0), [products]);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Admin
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Administrative tools and settings. Only admins should access.
        </motion.p>

        {/* Stats */}
        <motion.div className="mb-6 grid gap-4 md:grid-cols-3" variants={fadeUp}>
          <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <p className="text-xs text-text-body/70">Models</p>
            <p className="text-2xl font-semibold text-text-hi">{stats ? stats.models : "…"}</p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <p className="text-xs text-text-body/70">Templates</p>
            <p className="text-2xl font-semibold text-text-hi">{stats ? stats.templates : "…"}</p>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <p className="text-xs text-text-body/70">Products</p>
            <p className="text-2xl font-semibold text-text-hi">{stats ? stats.products : "…"}</p>
          </div>
        </motion.div>

        {/* Moderation: recent product uploads */}
        <motion.div className="glass-card p-6" variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="">Image moderation</h3>
            <span className="text-xs text-text-body/70">{productCount} items</span>
          </div>

          {!products && <div className="text-text-body">Loading…</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(products || []).map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border bg-white">
                <div className="relative aspect-[4/5] w-full">
                  <img src={p.imageUrl} alt={p.name || p.id} className="h-full w-full object-cover" />
                </div>
                <div className="p-3 flex items-center gap-2">
                  <span className="text-xs text-text-body/80 truncate">{p.name || "Untitled"}</span>
                  <button
                    className={cn(
                      "ml-auto text-xs text-red-500 hover:text-red-600 underline underline-offset-2 disabled:opacity-60"
                    )}
                    onClick={() => onDelete(p.id)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products && products.length === 0 && (
            <div className="text-text-body">No uploads found.</div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}