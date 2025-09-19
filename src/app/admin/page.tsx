"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

export default function AdminPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Admin
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Administrative tools and settings. Placeholder page.
        </motion.p>

        <motion.div className="glass-card p-6" variants={fadeUp}>
          <p className="text-text-body">Only users with admin privileges should access this area.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}