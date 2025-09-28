"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  getSelectedModelId,
  getSelectedTemplateId,
  setSelectedModelId,
  setSelectedTemplateId,
  cn,
} from "@/lib/utils";

// Landing sections styled to match the provided design

export default function Page() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [openPicker, setOpenPicker] = useState(false);

  useEffect(() => {
    setSelectedModel(getSelectedModelId());
    setSelectedTemplate(getSelectedTemplateId());
  }, []);

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white" />
        </div>
        <div className="relative max-w-screen-xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900"
            >
              Ignite Your Products with AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-4 text-slate-600 text-sm md:text-base"
            >
              Unleash the power of AI to create stunning virtual try‑ons and captivating product ads, effortlessly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6"
            >
              <Link
                href={"/generator" as Route}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
              >
                Start Creating Now
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Trio */}
      <section className="bg-white">
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Transform Your Vision into Reality</h2>
            <p className="mt-2 text-slate-600">
              AI Product Studio is your all‑in‑one platform for next‑gen product visualization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Virtual Try-On", desc: "See your products on diverse models in realistic scenarios.", href: "/generator" },
              { title: "AI Ad Generation", desc: "Generate captivating product ads tailored to your brand.", href: "/test-prompts" },
              { title: "Powerful AI Tools", desc: "Enhance images, remove backgrounds, and integrate seamlessly.", href: "/generator" },
            ].map((f) => (
              <Link
                key={f.title}
                href={f.href as Route}
                className="rounded-2xl border shadow-sm p-6 hover:shadow-md transition bg-white"
              >
                <div className="text-indigo-600 mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="font-semibold text-slate-900">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced features cards */}
      <section className="bg-slate-50">
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Explore Our Advanced Features</h3>
            <p className="mt-2 text-slate-600">Dive deeper into capabilities that redefine your product presentation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "AI Tool Suite", desc: "Discover advanced AI functionalities for product imagery.", href: "/generator" },
              { title: "Flexible Pricing", desc: "Pick the perfect plan that scales with your business.", href: "/pricing" },
              { title: "Generate Product Ads", desc: "Create stunning, high‑quality ads for your products.", href: "/test-prompts" },
            ].map((f) => (
              <Link
                key={f.title}
                href={f.href as Route}
                className="rounded-2xl border shadow-sm p-6 hover:shadow-md transition bg-white"
              >
                <div className="text-indigo-600 mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="font-semibold text-slate-900">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-screen-xl mx-auto px-4 py-14 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Ready to Get Started?</h3>
          <p className="mt-2 text-slate-600">Join businesses elevating their product imagery with AI.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href={"/signup" as Route} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500">
              Sign Up Now
            </Link>
            <Link href={"/signin" as Route} className="px-5 py-2.5 rounded-xl border bg-white text-slate-900 font-semibold hover:bg-slate-50">
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}