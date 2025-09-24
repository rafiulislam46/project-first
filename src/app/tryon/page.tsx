"use client";

import React from "react";

type PredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "queued";

interface ReplicatePrediction {
  id: string;
  version: string;
  status: PredictionStatus;
  output?: unknown;
  error?: unknown;
}

export default function TryOnPage() {
  const [humanUrl, setHumanUrl] = React.useState<string | null>(null);
  const [clothUrl, setClothUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  async function pollPrediction(id: string): Promise<ReplicatePrediction> {
    // Poll our server proxy so we never expose the token
    // Poll every 1.5s until status is terminal
    // eslint-disable-next-line no-constant-condition
    for (;;) {
      const res = await fetch(`/api/generator?id=${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await res.json()) as ReplicatePrediction;

      if (
        data.status === "succeeded" ||
        data.status === "failed" ||
        data.status === "canceled"
      ) {
        return data;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  function extractFirstImageUrl(output: unknown): string | null {
    if (!output) return null;
    if (typeof output === "string") return output;
    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object" && "url" in first) {
        const maybe = (first as { url?: unknown }).url;
        return typeof maybe === "string" ? maybe : null;
      }
    }
    if (output && typeof output === "object") {
      // Some models return { image: "..." } or similar
      if ("image" in output) {
        const maybe = (output as { image?: unknown }).image;
        return typeof maybe === "string" ? maybe : null;
      }
    }
    return null;
    }

  const onGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResultUrl(null);

    if (!humanUrl || !clothUrl) {
      setError("Please provide both Human Image URL and Cloth Image URL.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          human_img: humanUrl,
          garm_img: clothUrl,
        }),
      });

      const data = (await res.json()) as ReplicatePrediction;

      if (!res.ok) {
        const msg =
          (typeof data.error === "string" && data.error) ||
          "Failed to start prediction.";
        throw new Error(msg);
      }

      let final: ReplicatePrediction = data;

      // If the initial response isn't completed, poll until done
      if (data.status !== "succeeded") {
        final = await pollPrediction(data.id);
      }

      if (final.status === "succeeded") {
        const url = extractFirstImageUrl(final.output);
        if (url) {
          setResultUrl(url);
        } else {
          setError("Prediction succeeded but no image URL was found in output.");
        }
      } else {
        const msg =
          (typeof final.error === "string" && final.error) ||
          "Prediction failed.";
        throw new Error(msg);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Virtual Try-On (Replicate)</h1>
      <form onSubmit={onGenerate} className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="human" className="block text-sm text-gray-300 mb-1">
              Human Image URL
            </label>
            <input
              id="human"
              type="url"
              required
              placeholder="https://example.com/human.jpg"
              value={humanUrl ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHumanUrl(e.target.value)
              }
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="cloth" className="block text-sm text-gray-300 mb-1">
              Cloth Image URL
            </label>
            <input
              id="cloth"
              type="url"
              required
              placeholder="https://example.com/cloth.jpg"
              value={clothUrl ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setClothUrl(e.target.value)
              }
              className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-md border border-red-700 bg-red-900/30 p-3 text-red-200">
          {error}
        </div>
      )}

      {resultUrl && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg text-gray-200">Result</h2>
          <div className="w-full overflow-hidden rounded-lg border border-gray-700">
            {/* The image stacks under inputs on small screens due to block layout */}
            <img
              src={resultUrl}
              alt="Virtual Try-On Result"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}