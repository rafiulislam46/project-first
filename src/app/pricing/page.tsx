"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

type Toast = { id: number; message: string };

export default function PricingPage() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const plans = useMemo(
    () => [
      {
        key: "free",
        title: "Free",
        price: "$0",
        period: "/mo",
        badge: "Get started",
        highlight: false,
        features: ["5 images", "Watermark", "Limited models", "Email support"],
      },
      {
        key: "pro",
        title: "Pro",
        price: "$19",
        period: "/mo",
        badge: "Most popular",
        highlight: true,
        features: ["100 images", "No watermark", "All models", "Priority support"],
      },
      {
        key: "business",
        title: "Business",
        price: "$99",
        period: "/mo",
        badge: "Teams",
        highlight: false,
        features: ["500 images", "No watermark", "All models", "Team seats"],
      },
      {
        key: "enterprise",
        title: "Enterprise",
        price: "Custom",
        period: "",
        badge: "Scale",
        highlight: false,
        features: ["Unlimited images", "Dedicated support", "Security & SSO", "SLA"],
      },
    ],
    []
  );

  const handleSelect = (title: string) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message: `${title} upgrade flow coming soon.` }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Pricing
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Flexible plans to match your workflow. Upgrade anytime.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer}>
          {plans.map((p) => (
            <motion.div
              key={p.key}
              className={cn(
                "relative glass-card p-6 flex flex-col",
                p.highlight ? "ring-2 ring-accent-1/40" : "ring-1 ring-white/10"
              )}
              variants={fadeUp}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3>{p.title}</h3>
                <span className="rounded-full border px-2 py-0.5 text-[10px] text-text-body/80">{p.badge}</span>
              </div>
              <div className="mb-5">
                <span className="text-3xl font-semibold text-text-hi">{p.price}</span>
                <span className="text-text-body/70"> {p.period}</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-text-body/90">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={cn("btn-gradient mt-auto w-full", p.highlight ? "shadow-lg" : "")}
                onClick={() => handleSelect(p.title)}
              >
                {p.title === "Free" ? "Current Plan" : `Choose ${p.title}`}
              </button>

              {/* Payment badges */}
              <div className="mt-4 flex items-center gap-2 opacity-80">
                <BadgeVisa />
                <BadgeMastercard />
                <BadgeAmex />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border bg-white/10 p-3 text-white shadow-lg backdrop-blur"
          >
            <div className="h-2 w-2 rounded-full bg-current" />
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BadgeVisa() {
  return (
    <svg width="40" height="24" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" className="rounded-md border bg-white/90 p-1">
      <text x="6" y="16" fontSize="12" fontFamily="Inter, system-ui" fill="#1A237E">VISA</text>
    </svg>
  );
}
function BadgeMastercard() {
  return (
    <svg width="40" height="24" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" className="rounded-md border bg-white/90 p-1">
      <circle cx="18" cy="12" r="6" fill="#EA4335" />
      <circle cx="24" cy="12" r="6" fill="#FBBC05" fillOpacity="0.85" />
    </svg>
  );
}
function BadgeAmex() {
  return (
    <svg width="40" height="24" viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" className="rounded-md border bg-white/90 p-1">
      <text x="4" y="16" fontSize="10" fontFamily="Inter, system-ui" fill="#0D47A1">AMEX</text>
    </svg>
  );
}