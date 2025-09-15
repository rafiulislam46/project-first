"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

export default function ResultPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Result
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Display processed results here. Placeholder content.
        </motion.p>

        <motion.div className="glass-card p-6" variants={fadeUp}>
          <pre className="text-sm text-text-body/90">
            {`{
  "status": "ok",
  "summary": "Your file was processed successfully.",
  "items": 3
}`}
          </pre>
        </motion.div>
      </motion.div>
    </section>
  );
}