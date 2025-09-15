"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

export default function TemplatesPage() {
  const templates = [
    { name: "Blog Post", desc: "SEO-friendly long-form article." },
    { name: "Marketing Email", desc: "High-converting newsletter." },
    { name: "Support Reply", desc: "Polished, on-brand responses." },
    { name: "Landing Copy", desc: "Hero, features, and CTA." },
  ];

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Templates
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Start from curated templates and customize to your needs.
        </motion.p>

        <motion.div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3" variants={staggerContainer}>
          {templates.map((t) => (
            <motion.div key={t.name} className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">{t.name}</h3>
              <p className="text-text-body">{t.desc}</p>
              <button className="btn-gradient mt-4">Use template</button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}