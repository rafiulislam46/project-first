"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { useAuth } from "@/lib/AuthProvider";
import {
  LayoutGrid,
  CreditCard,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Users,
  Gauge,
  ShoppingCart,
  Filter,
} from "lucide-react";

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
        {/* Shell layout */}
        <motion.div variants={fadeUp} className="container mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="rounded-2xl border bg-white p-4 shadow-soft-1">
            <nav className="space-y-1">
              <SidebarLink href="/dashboard" label="Dashboard" Icon={LayoutGrid} active />
              <SidebarLink href="/pricing" label="Credits" Icon={CreditCard} />
              <SidebarLink href="/gallery" label="Gallery" Icon={ImageIcon} />
              <SidebarLink href="/settings" label="Settings" Icon={SettingsIcon} />
            </nav>
            <div className="mt-8 pt-4 border-t text-xs text-text-body">@{email.split("@")[0] || "user"}</div>
          </aside>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Your Overview</h2>
              <p className="text-text-body mb-4">Quick summary of your account activity.</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <OverviewCard
                  title="Friends Left"
                  value="12"
                  description="Social connections remaining for exclusive features."
                  Icon={Users}
                />
                <OverviewCard
                  title="Current Credits Usage"
                  value={creditsDisplay}
                  description="Credits available for generating new content."
                  Icon={Gauge}
                />
                <ActionCard
                  title="Buy Additional Credits"
                  buttonLabel="Buy More Credits"
                  href="/pricing"
                  Icon={ShoppingCart}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Your Creations</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-text-hi hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>

              {/* Placeholder gallery grid */}
              <div className="mt-4 grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border bg-white p-4 shadow-soft-1 hover:shadow-soft-2 transition-shadow"
                  >
                    <div className="aspect-square rounded-xl bg-gray-100/70 grid place-items-center text-xs text-text-body">
                      Image Placeholder
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* Components */

function SidebarLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
        active ? "bg-gray-50 text-text-hi" : "text-text-body hover:bg-gray-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

function OverviewCard({
  title,
  value,
  description,
  Icon,
}: {
  title: string;
  value: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft-1">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-text-hi" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-text-body/70">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-text-hi">{value}</div>
          <div className="mt-1 text-xs text-text-body">{description}</div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  buttonLabel,
  href,
  Icon,
}: {
  title: string;
  buttonLabel: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-soft-1">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-text-hi" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-text-body/70">{title}</div>
          <div className="mt-3">
            <a href={href} className="inline-flex items-center rounded-xl btn-gradient px-4 py-2 text-white text-sm">
              {buttonLabel}
            </a>
          </div>
          <div className="mt-1 text-xs text-text-body">Expand your creative potential with more credits.</div>
        </div>
      </div>
    </div>
  );
}