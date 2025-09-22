"use client";

import React, { useState } from "react";

export default function TestGeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUrl(null);
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setError(data?.error || "Failed to generate image.");
      } else {
        setUrl(String(data.url));
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-white/90">Test Image Generation</h1>
      <p className="text-white/60 mt-2">Enter a prompt to generate an image using Replicate (SDXL) and upload it to Cloudinary.</p>

      <form onSubmit={handleGenerate} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
        <textarea
          className="w-full min-h-[90px] rounded-md bg-white/10 text-white placeholder-white/50 p-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/30"
          placeholder="A futuristic cityscape at dusk, ultra-detailed, cinematic lighting"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-md bg-white text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && <div className="mt-4 text-red-300 text-sm">{error}</div>}

      {url && (
        <div className="mt-8">
          <h2 className="text-white/90 font-medium mb-3">Result</h2>
          <div className="w-full">
            <img
              src={url}
              alt="Generated"
              className="w-full max-w-full rounded-lg shadow-lg object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}