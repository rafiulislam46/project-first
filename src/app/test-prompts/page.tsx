"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

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

export default function ProductAdGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

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
    <div className="px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-white/90">Product Ad Generator</h1>
      <p className="text-white/70 mt-2">
        Upload a product image, pick a style prompt, and generate a premium ad visual using OpenAI.
      </p>

      {/* Step 1: Upload product image */}
      <section className="mt-8">
        <h2 className="text-white/90 font-medium mb-3">Step 1 — Upload product image</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-white/80"
          />
          {file && (
            <div className="mt-3 text-xs text-white/60">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          )}
        </div>
      </section>

      {/* Step 2: Prompt cards */}
      <section className="mt-10">
        <h2 className="text-white/90 font-medium mb-3">Step 2 — Choose a prompt</h2>
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
                <div className="text-white font-medium">{p.title}</div>
                <div className="text-white/70 text-sm mt-1">{p.text}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Generate */}
      <section className="mt-10">
        <Button
          disabled={!canGenerate || loading}
          onClick={onGenerate}
          className="h-11 px-6"
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
        {error && <div className="mt-3 text-red-300 text-sm">{error}</div>}
      </section>

      {/* Result */}
      {resultUrl && (
        <section className="mt-10">
          <h2 className="text-white/90 font-medium mb-3">Result</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <img src={resultUrl} alt="Generated product ad" className="w-full h-auto object-contain" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}