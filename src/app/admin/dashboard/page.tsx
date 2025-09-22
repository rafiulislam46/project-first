"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cn } from "@/lib/utils";

const mock = {
  totalUsers: 1280,
  totalImages: 5423,
  activePlans: 312,
  revenue: 18450,
  monthly: Array.from({ length: 12 }).map((_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    signups: Math.floor(40 + Math.random() * 160),
    payments: Math.floor(10 + Math.random() * 90),
  })),
};

export default function DashboardPage() {
  const maxY = Math.max(
    ...mock.monthly.map((m) => Math.max(m.signups, m.payments))
  );

  return (
    <section className="py-4 md:py-6">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Dashboard
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Overview of users, images, plans, and revenue.
        </motion.p>

        {/* Top cards */}
        <motion.div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={fadeUp}>
          <DashCard title="Total Users" value={mock.totalUsers.toLocaleString()} />
          <DashCard title="Total Images" value={mock.totalImages.toLocaleString()} />
          <DashCard title="Active Plans" value={mock.activePlans.toLocaleString()} />
          <DashCard title="Revenue" value={`$${mock.revenue.toLocaleString()}`} />
        </motion.div>

        {/* Chart */}
        <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-6 shadow-soft-1">
          <div className="mb-4 flex items-center justify-between">
            <h3>Monthly signups and payments</h3>
            <span className="text-xs text-text-body/70">Mock data</span>
          </div>

          <div className="grid grid-cols-12 gap-2 h-40 sm:h-56">
            {mock.monthly.map((m) => {
              const sH = (m.signups / maxY) * 100;
              const pH = (m.payments / maxY) * 100;
              return (
                <div key={m.month} className="flex flex-col justify-end gap-1">
                  <div className="flex items-end gap-1 h-full">
                    <div className="w-2 sm:w-3 rounded bg-gradient-to-t from-accent-1/50 to-accent-1/80" style={{ height: `${sH}%` }} />
                    <div className="w-2 sm:w-3 rounded bg-gradient-to-t from-purple-400/50 to-purple-500/80" style={{ height: `${pH}%` }} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-text-body/70 text-center">{m.month}</span>
                </div>
              );
            })}
          </div>
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