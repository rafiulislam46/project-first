"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, cn } from "@/lib/utils";

type PromptCard = {
  id: string;
  title: string;
  text: string;
};

const PROMPTS: PromptCard[] = [
  { id: "luxury", title: "Luxury Ad Style", text: "High-end luxury product photo with golden accents, premium lighting" },
  { id: "minimal", title: "Minimal Background", text: "Simple white background, focus on product only" },
  { id: "lifestyle", title: "Lifestyle Scene", text: "Product in natural lifestyle setting, warm lighting" },
  { id: "studio", title: "Modern Studio", text: "Product in a premium photography studio, soft shadows" },
  { id: "bold", title: "Bold Colors", text: "Vibrant background, eye-catching, marketing style" },
  { id: "outdoor", title: "Natural Outdoor", text: "Product in outdoor setting, natural sunlight" },
];

function TestPromptsContent() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const canGenerate = useMemo(() => Boolean(file && selectedId), [file, selectedId]);

  async function onGenerate() {
    setError(null);
    setResultUrl(null);
    if (!canGenerate) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file!);
      fd.append("promptId", selectedId!);

      const res = await fetch("/api/test-generate", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || data?.error) {
        const msg = data?.error || `Failed (${res.status})`;
        setError(msg);
      } else {
        setResultUrl(String(data.secure_url || data.url));
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Product Ad Generator
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Upload a product image, pick a style prompt, then generate a premium ad visual.
        </motion.p>

        {/* Upload card (same structure as /generator) */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="mb-3 text-sm text-text-body">Product image (PNG/JPG)</div>
          <div className={cn("relative rounded-2xl border border-dashed bg-surface/40 p-4")}>
            <input
              id="file-input"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFile(f);
                const url = URL.createObjectURL(f);
                setPreviewUrl((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return url;
                });
              }}
              disabled={loading}
            />
            <label htmlFor="file-input" className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 text-center">
              {!previewUrl ? (
                <>
                  <span className="text-sm text-text-body">Click to upload or drag-and-drop your image here</span>
                  <span className="text-xs text-text-body/70">PNG or JPG, up to 15MB</span>
                </>
              ) : (
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
                  <div className="overflow-hidden rounded-xl border">
                    {loading ? (
                      <div className="flex aspect-square items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-1" />
                      </div>
                    ) : (
                      <img alt="Preview" src={previewUrl} className="aspect-square h-auto w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-text-hi">{file?.name}</p>
                      <p className="text-xs text-text-body/70">
                        {(file?.size ?? 0) > 0 ? `${Math.round((file!.size / 1024 / 1024) * 10) / 10} MB` : ""}
                      </p>
                      <p className="text-xs text-text-body/70">
                        Ready to generate
                      </p>
                    </div>
                    {loading && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
                        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Step 2: Prompt cards */}
          <div className="mt-6">
            <div className="mb-3 text-sm text-text-body">Choose a style prompt</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROMPTS.map((p) => {
                const selected = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected ? "bg-accent-1/10 border-accent-1/40 ring-2 ring-accent-1/50" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="text-text-hi font-medium">{p.title}</div>
                    <div className="text-text-body text-sm mt-1">{p.text}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-body/70">Step 3: Click Generate to create one ad image.</p>
            <button className="btn-gradient w-full sm:w-auto" onClick={onGenerate} disabled={!canGenerate || loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent-1" />
                  Generating…
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div variants={fadeUp} className="mt-6">
          {resultUrl ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden border bg-white/5">
                <img src={resultUrl} alt="Generated product ad" className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-3 text-sm text-text-body">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent-1" />
              Generating with Gemini…
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function ProductAdGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestPromptsContent />
    </Suspense>
  );
}