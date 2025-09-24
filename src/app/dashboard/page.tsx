"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthProvider";

type Counts = { models: number; templates: number; assets: number };

export default function DashboardPage() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let mounted = true;
    // Load credits
    fetch("/api/user/credits", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setCredits(typeof d.credits === "number" ? d.credits : 0);
      })
      .catch(() => setCredits(0));

    // Load app counts
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setCounts(d?.counts || { models: 0, templates: 0, assets: 0 });
      })
      .catch(() => setCounts({ models: 0, templates: 0, assets: 0 }));

    return () => {
      mounted = false;
    };
  }, []);

  const username = useMemo(() => {
    if (!user) return "Guest";
    // Prefer display name if present in user metadata
    const meta = (user as any)?.user_metadata || {};
    return meta.full_name || meta.name || user.email || "User";
  }, [user]);

  return (
    <section className="py-6 md:py-8">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Dashboard
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Welcome{user ? `, ${username}` : ""}. Here’s your account overview.
        </motion.p>

        {/* User plan + credits */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <DashCard title="Credits Remaining" value={credits === null ? "…" : credits === -1 ? "Unlimited" : String(credits)} />
          <DashCard title="Models in catalog" value={String(counts?.models ?? 0)} />
          <DashCard title="Templates available" value={String(counts?.templates ?? 0)} />
          <DashCard title="Your generated assets" value={String(counts?.assets ?? 0)} />
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-6 shadow-soft-1">
          <h3 className="mb-3">Quick actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/generator" className="rounded-xl btn-gradient px-4 py-3 text-white text-sm inline-flex items-center justify-center">
              Open Generator
            </a>
            <a href="/upload" className="rounded-xl border px-4 py-3 text-sm inline-flex items-center justify-center">
              Upload Product Photos
            </a>
          </div>
          <p className="mt-4 text-xs text-text-body/70">
            Credits are used when generating model try-ons or template-based scenes. Unlimited plans show as “Unlimited”.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

function DashCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft-1 backdrop-blur-sm">
      <p className="text-xs text-text-body/70">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-text-hi">{value}</p>
    </div>
  );
}