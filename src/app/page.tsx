import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <AnimatePresence>
      <section className="relative">
        <div className="container py-16 md:py-24">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.h1 className="mb-4" variants={fadeUp}>
              Build premium experiences, faster.
            </motion.h1>
            <motion.p className="mb-8 text-text-body" variants={fadeUp}>
              A dark, luxurious, minimal Next.js 14 starter with Tailwind, shadcn/ui patterns, and
              Framer Motion. Accessible by default, animated when allowed.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
              <a href="/components" className="btn-gradient">
                Explore Components
              </a>
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm text-text-hi hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/40"
              >
                Docs <ArrowRight size={16} />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {[
              { title: "Design System", desc: "Glass cards, premium buttons, elegant inputs." },
              { title: "Motion Ready", desc: "Variants + AnimatePresence with reduced-motion." },
              { title: "Accessible", desc: "WCAG AA contrast and focus-visible states." },
            ].map((c) => (
              <motion.div key={c.title} className="glass-card p-6" variants={fadeUp}>
                <h3 className="mb-2">{c.title}</h3>
                <p className="text-text-body">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}