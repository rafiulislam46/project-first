"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

export default function ModelsPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Models
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Available models and their capabilities.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
          {[
            { name: "Model A", desc: "Great for summarization." },
            { name: "Model B", desc: "Best for code generation." },
            { name: "Model C", desc: "Balanced for chat + tools." },
          ].map((m) => (
            <motion.div key={m.name} className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">{m.name}</h3>
              <p className="text-text-body">{m.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}