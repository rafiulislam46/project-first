"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Dashboard
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Overview of your recent activity and quick links.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
          {[
            { title: "Projects", value: 12 },
            { title: "Templates Used", value: 34 },
            { title: "Pending Jobs", value: 2 },
          ].map((c) => (
            <motion.div key={c.title} className="glass-card p-6" variants={fadeUp}>
              <p className="text-sm text-text-body/80">{c.title}</p>
              <p className="text-3xl font-semibold text-text-hi mt-1">{c.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}