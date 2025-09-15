"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ComponentsPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Components
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          A small sample of the design system: glass cards, premium buttons, and inputs.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h3 className="mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h3 className="mb-3">Inputs</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-text-body">Email</span>
                <input type="email" className="input-premium w-full" placeholder="you@example.com" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-text-body">Message</span>
                <textarea className="input-premium w-full h-24 resize-none" placeholder="Tell us more..." />
              </label>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h3 className="mb-3">Card</h3>
            <p className="text-text-body">
              This card uses a glass effect with backdrop blur, subtle border, and layered soft shadows.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}