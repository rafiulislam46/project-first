"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useMemo } from "rea_code "react";

export const metadata: Metadata = {
  title: "AI Product Studio — Model Try‑On, Templates, Copy & Variations",
  description:
    "Generate premium visuals in minutes. Model try‑ons, reference templates, auto copywriting, and 5 fast variations. Accessible, fast, and delightful.",
  openGraph: {
    title: "AI Product Studio — Model Try‑On, Templates, Copy & Variations",
    description:
      "Generate premium visuals in minutes. Model try‑ons, reference templates, auto copywriting, and 5 fast variations.",
    url: "https://example.com/",
    images: [{ url: "/demo/tryon/1.svg", width: 1200, height: 630, alt: "Demo preview" }],
  },
  alternates: { canonical: "/" },
};

function useParallaxTilt(range = 2) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useTransform(ry, [-0.5, 0.5], [range, -range]);
  const rotateY = useTransform(rx, [-0.5, 0.5], [-range, range]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(px);
    ry.set(py);
  }
  function onMouseLeave() {
    rx.set(0);
    ry.set(0);
  }

  return { rotateX, rotateY, onMouseMove, onMouseLeave };
}

function PaymentBadges() {
  const badges = [
    { key: "bkash", label: "bKash", color: "from-[#E2136E] to-[#F5C44F]" },
    { key: "nagad", label: "Nagad", color: "from-[#F6921E] to-[#FDC830]" },
    { key: "rocket", label: "Rocket", color: "from-[#7A1FA2] to-[#C471ED]" },
    { key: "card", label: "Card", color: "from-[#2AA0F5] to-[#6EE7F9]" },
  ] as const;

  return (
    <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Supported payment methods">
      {badges.map((b) => (
        <li key={b.key}>
          <span
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs text-text-hi"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            }}
          >
            {/* Minimal inline SVG marks for each method */}
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="opacity-80">
              <defs>
                <linearGradient id={`g-${b.key}`} x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" />
                  <stop offset="100%" stopColor="currentColor" />
                </linearGradient>
              </defs>
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeOpacity="0.6" />
              <path d="M4 9l2.2 2L12 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="sr-only">{b.label} supported</span>
            <span aria-hidden="true">{b.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  // Demo images from /public/demo/tryon
  const demo = useMemo(
    () => ["/demo/tryon/1.svg", "/demo/tryon/2.svg", "/demo/tryon/3.svg", "/demo/tryon/4.svg", "/demo/tryon/5.svg"],
    []
  );

  const tilt = useParallaxTilt(2);

  return (
    <AnimatePresence>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Subtle animated gradient/particles */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
               style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.18), transparent)" }} />
          <div className="absolute top-32 right-16 h-56 w-56 rounded-full blur-3xl"
               style={{ background: "radial-gradient(closest-side, rgba(245,196,79,0.16), transparent)" }} />
          {[...Array(14)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/25"
              style={{
                top: `${(i * 37) % 100}%`,
                left: `${(i * 61) % 100}%`,
              }}
              initial={{ opacity: 0.2, y: 0 }}
              animate={{ opacity: [0.15, 0.35, 0.15], y: [-2, 2, -2] }}
              transition={{ duration: 5 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
          ))}
        </motion.div>

        <div className="container py-20 md:py-28">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.h1 className="mb-5" variants={fadeUp}>
              Create on-brand visuals with AI—fast.
            </motion.h1>
            <motion.p className="mx-auto mb-10 max-w-2xl text-text-body" variants={fadeUp}>
              Model try‑on, reference templates, instant copywriting, and 5 crisp variations—crafted
              for teams that care about quality, performance, and accessibility.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
              <Link href={"/upload" as Route} className="btn-gradient">
                Start Free
              </Link>
              <Link
                href={"/pricing" as Route}
                className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm text-text-hi hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/40"
              >
                See Pricing <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero art with subtle parallax tilt */}
          <motion.div
            className="mx-auto mt-14 max-w-5xl"
            style={{ perspective: 1000 }}
            onMouseMove={tilt.onMouseMove}
            onMouseLeave={tilt.onMouseLeave}
          >
            <motion.div
              className="group relative rounded-3xl border bg-card/60 p-3 shadow-soft-1 backdrop-blur-md"
              style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: "preserve-3d" as any }}
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {demo.map((src, idx) => (
                  <div
                    key={src}
                    className="relative aspect-square overflow-hidden rounded-2xl border"
                    aria-label={`Demo style ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Demo thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }} />
                  </div>
                ))}
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-0.5 -z-10 rounded-[28px] opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(245,196,79,0.18))",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { title: "Model Try‑On", desc: "Drop a photo, try styles instantly." },
              { title: "Reference Templates", desc: "Consistent framing and lighting." },
              { title: "Auto Copywriting", desc: "On-brand headlines and CTAs." },
              { title: "5 Variations", desc: "Quality options, ready to ship." },
            ].map((c) => (
              <motion.div
                key={c.title}
                variants={fadeUp}
                className="group glass-card p-6 transition-transform [transform:perspective(800px)_rotateX(0deg)_rotateY(0deg)] hover:[transform:perspective(800px)_rotateX(2deg)_rotateY(-2deg)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(245,196,79,0.2))",
                  }}
                />
                <h3 className="mb-2">{c.title}</h3>
                <p className="text-text-body">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DEMO STRIP */}
      <section aria-labelledby="demo-heading" className="relative">
        <div className="container py-8 md:py-12">
          <h2 id="demo-heading" className="sr-only">
            Demo styles
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {demo.map((src, i) => (
              <figure key={src} className="overflow-hidden rounded-2xl border">
                <img src={src} alt={`Generated demo style ${i + 1}`} className="h-full w-full object-cover" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section aria-labelledby="pricing-preview" className="relative">
        <div className="container py-16 md:py-20">
          <div className="glass-card mx-auto max-w-3xl p-8 text-center">
            <h2 id="pricing-preview" className="mb-3">
              Simple pricing that scales with you
            </h2>
            <p className="mx-auto max-w-xl text-text-body">
              Start free. Upgrade for faster generations, higher resolutions, and team collaboration.
            </p>
            <div className="mt-6">
              <Link href={"/pricing" as Route} className="btn-gradient">
                View Pricing
              </Link>
            </div>
            <PaymentBadges />
          </div>
        </div>
      </section>
    </AnimatePresence>
  );
}