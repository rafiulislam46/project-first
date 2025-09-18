"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  getSelectedModelId,
  getSelectedTemplateId,
  cn,
} from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    setSelectedModel(getSelectedModelId());
    setSelectedTemplate(getSelectedTemplateId());
  }, []);

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          AI Product Studio
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-2xl text-lg text-text-body"
        >
          Upload your product, choose a model and template, then generate premium styled variations in minutes.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 w-full sm:w-auto"
        >
          <Link href="#features" className="btn-gradient inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3">
            Get Started <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Features section */}
      <section id="features" className="container py-12 md:py-16">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.h2 className="mb-2" variants={fadeUp}>
            Features
          </motion.h2>
          <motion.p className="mb-8 text-text-body" variants={fadeUp}>
            Core steps to create your visuals: upload, pick a model, choose a template, and prompt the generator.
          </motion.p>

          <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer}>
            {/* Upload */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Upload</h3>
              <p className="text-sm text-text-body mb-4">Add your product photo to begin.</p>
              <label className="block">
                <span className="mb-2 block text-xs text-text-body">Choose file</span>
                <input type="file" className="input-premium w-full" />
              </label>
              <Link href="/upload" className="btn-gradient mt-4 inline-block w-full sm:w-auto text-center">Go to Upload</Link>
            </motion.div>

            {/* Model select */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Model Select</h3>
              <p className="text-sm text-text-body mb-4">
                Pick a model to try your product on.
              </p>
              <div className="rounded-2xl border bg-white/5 p-3 text-xs text-text-body">
                Current: <span className="font-medium text-text-hi">{selectedModel ?? "None"}</span>
              </div>
              <Link href="/models" className="btn-gradient mt-4 inline-block w-full sm:w-auto text-center">Browse Models</Link>
            </motion.div>

            {/* Template select */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Template Select</h3>
              <p className="text-sm text-text-body mb-4">
                Choose a scene or reference template.
              </p>
              <div className="rounded-2xl border bg-white/5 p-3 text-xs text-text-body">
                Current: <span className="font-medium text-text-hi">{selectedTemplate ?? "None"}</span>
              </div>
              <Link href="/templates" className="btn-gradient mt-4 inline-block w-full sm:w-auto text-center">Browse Templates</Link>
            </motion.div>

            {/* Prompt box */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Prompt</h3>
              <p className="text-sm text-text-body mb-4">
                Describe the desired style or outcome.
              </p>
              <textarea
                className="input-premium w-full h-24 resize-none"
                placeholder="e.g., Soft daylight studio, clean backdrop, premium beauty aesthetic"
              />
              <button className={cn("btn-gradient mt-4 w-full sm:w-auto")}>Generate</button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Dashboard skeleton preview */}
      <section className="container pb-16">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.h2 className="mb-2" variants={fadeUp}>
            Dashboard
          </motion.h2>
          <motion.p className="mb-8 text-text-body" variants={fadeUp}>
            Quick look at your workspace. Visit the dashboard for full details.
          </motion.p>

          <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
            {[
              { title: "Projects", value: 12 },
              { title: "Templates Used", value: 34 },
              { title: "Pending Jobs", value: 2 },
            ].map((c) => (
              <motion.div key={c.title} className="glass-card p-6" variants={fadeUp}>
                <p className="text-sm text-text-body/80">{c.title}</p>
                <p className="text-3xl font-semibold text-text-hi mt-1">{c.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6">
            <Link href="/dashboard" className="btn-gradient inline-block w-full sm:w-auto text-center">Open Dashboard</Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}