"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
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

  const email = useMemo(() => user?.email ?? "", [user]);
  const creditsDisplay = useMemo(() => {
    if (credits === null) return "…";
    return credits === -1 ? "Unlimited" : String(credits);
  }, [credits]);

  if (!user) {
    return (
      <section className="container py-12 md:py-16">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.h2 className="mb-2" variants={fadeUp}>
            Dashboard
          </motion.h2>
          <motion.p className="mb-6 text-text-body" variants={fadeUp}>
            Please sign in to view your dashboard.
          </motion.p>
          <motion.div variants={fadeUp}>
            <a href="/signin" className="inline-flex items-center rounded-xl btn-gradient px-4 py-2 text-white text-sm">
              Go to Sign In
            </a>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-8">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Dashboard
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Signed in as <span className="font-medium text-text-hi">{email}</span>.
        </motion.p>

        {/* Placeholder stats + real counts if available */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <DashCard title="Credits left" value={creditsDisplay} />
          <DashCard title="Generated images" value={String(counts?.assets ?? 0)} />
          <DashCard title="Models in catalog" value={String(counts?.models ?? 0)} />
          <DashCard title="Templates available" value={String(counts?.templates ?? 0)} />
        </motion.div>

        {/* Upgrade plan */}
        <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-6 shadow-soft-1">
          <h3 className="mb-3">Upgrade your plan</h3>
          <p className="text-text-body mb-4">Get more credits and features by upgrading.</p>
          <a href="/pricing" className="rounded-xl btn-gradient px-4 py-2 text-white text-sm inline-flex items-center">
            View Pricing
          </a>
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