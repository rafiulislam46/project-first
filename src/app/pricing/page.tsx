"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

export default function PricingPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Pricing
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Simple, transparent pricing to get started quickly.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
          {[
            { title: "Starter", price: "$0", features: ["Basic templates", "Community support"] },
            { title: "Pro", price: "$19", features: ["All templates", "Priority support", "API access"] },
            { title: "Team", price: "$49", features: ["Team seats", "Admin tools", "SLA support"] },
          ].map((tier) => (
            <motion.div key={tier.title} className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">{tier.title}</h3>
              <p className="mb-4 text-text-hi text-2xl font-semibold">{tier.price}/mo</p>
              <ul className="space-y-2 text-text-body">
                {tier.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <button className="btn-gradient mt-6 w-full">Choose {tier.title}</button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}