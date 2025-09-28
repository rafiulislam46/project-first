"use client";

import React from "react";

/**
 * Redesigned Virtual Try-On UI
 * - Upload product image (garment) via /api/generator multipart to get a URL
 * - Choose a model (male/female) from a dropdown and thumbnails (sets human image URL)
 * - Choose number of images (1–5)
 * - Generate results in a right-side panel without changing backend APIs/routes
 */

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

type ModelItem = {
  id: string;
  label: string;
  gender: "male" | "female";
  imgUrl: string;
};

// Use existing public assets for demo thumbnails
const FEMALE_MODELS: ModelItem[] = [
  { id: "F01", label: "Female Model 1", gender: "female", imgUrl: "/catalog/models/M01.svg" },
  { id: "F02", label: "Female Model 2", gender: "female", imgUrl: "/demo/tryon/1.svg" },
  { id: "F03", label: "Female Model 3", gender: "female", imgUrl: "/demo/tryon/5.svg" },
];

const MALE_MODELS: ModelItem[] = [
  { id: "M01", label: "Male Model 1", gender: "male", imgUrl: "/catalog/models/M02.svg" },
  { id: "M02", label: "Male Model 2", gender: "male", imgUrl: "/demo/tryon/2.svg" },
  { id: "M03", label: "Male Model 3", gender: "male", imgUrl: "/demo/tryon/3.svg" },
  { id: "M04", label: "Male Model 4", gender: "male", imgUrl: "/demo/tryon/4.svg" },
];

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function TryOnPage() {
  // Product upload
  const [productFile, setProductFile] = React.useState<File | null>(null);
  const [productPreview, setProductPreview] = React.useState<string | null>(null);
  const [garmentUrl, setGarmentUrl] = React.useState<string | null>(null);

  // Model selection
  const [gender, setGender] = React.useState<"female" | "male">("female");
  const [selectedModelId, setSelectedModelId] = React.useState<string | null>(FEMALE_MODELS[0].id);
  const [humanUrl, setHumanUrl] = React.useState<string | null>(FEMALE_MODELS[0].imgUrl);

  // Generate options
  const [count, setCount] = React.useState<number>(1);

  // Results
  const [results, setResults] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const models = gender === "female" ? FEMALE_MODELS : MALE_MODELS;

  React.useEffect(() => {
    const defaultModel = models[0];
    setSelectedModelId(defaultModel.id);
    setHumanUrl(defaultModel.imgUrl);
  }, [gender]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    return () => {
      if (productPreview) URL.revokeObjectURL(productPreview);
    };
  }, [productPreview]);

  async function pollPrediction(id: string): Promise<ReplicatePrediction> {
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
      if ("image" in output) {
        const maybe = (output as { image?: unknown }).image;
        return typeof maybe === "string" ? maybe : null;
      }
    }
    return null;
  }

  // Upload product image to Cloudinary via our existing /api/generator endpoint (multipart branch)
  async function uploadProductToCloud(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/generator", { method: "POST", body: form });
    const j = await res.json();
    if (!res.ok || !j?.url) {
      throw new Error(typeof j?.error === "string" ? j.error : "Upload failed");
    }
    return String(j.url);
  }

  const onSelectFile = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      setError("Please upload a PNG or JPG image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }
    setError(null);
    setProductFile(f);
    const obj = URL.createObjectURL(f);
    setProductPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return obj;
    });
    setGarmentUrl(null); // will be set on generate after upload
  };

  const onChooseModel = (id: string) => {
    setSelectedModelId(id);
    const m = models.find((x) => x.id === id);
    setHumanUrl(m?.imgUrl || null);
  };

  const changeCount = (delta: number) => {
    setCount((c) => Math.min(5, Math.max(1, c + delta)));
  };

  const canGenerate = !!humanUrl && !!(garmentUrl || productFile);

  const onGenerate = async () => {
    setError(null);
    setResults([]);

    if (!humanUrl) {
      setError("Please select a model.");
      return;
    }
    if (!garmentUrl && !productFile) {
      setError("Please upload a product image.");
      return;
    }

    try {
      setLoading(true);

      // If we have a local file, upload it first to get a URL
      let garm = garmentUrl;
      if (!garm && productFile) {
        garm = await uploadProductToCloud(productFile);
        setGarmentUrl(garm);
      }

      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const res = await fetch("/api/generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ human_img: humanUrl, garm_img: garm }),
        });

        const data = (await res.json()) as ReplicatePrediction;
        if (!res.ok) {
          const msg =
            (typeof data.error === "string" && data.error) ||
            "Failed to start prediction.";
          throw new Error(msg);
        }

        const final = data.status === "succeeded" ? data : await pollPrediction(data.id);

        if (final.status !== "succeeded") {
          const msg =
            (typeof final.error === "string" && final.error) || "Prediction failed.";
          throw new Error(msg);
        }

        const url = extractFirstImageUrl(final.output);
        if (url) out.push(url);
      }

      setResults(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Upload Product Image */}
          <div className="rounded-2xl border border-gray-700/60 bg-white/5 p-4">
            <h3 className="text-sm font-medium text-gray-100 mb-3">Upload Product Image</h3>
            <label
              htmlFor="file-input"
              className={classNames(
                "flex min-h-40 cursor-pointer items-center justify-center rounded-xl border border-dashed p-6 text-center transition",
                "bg-white/5 hover:bg-white/10"
              )}
            >
              <input
                id="file-input"
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(e) => onSelectFile(e.target.files)}
              />
              {!productPreview ? (
                <div className="space-y-1">
                  <div className="text-sm text-gray-300">Drag & drop your product image here,</div>
                  <div className="text-sm text-gray-300">or</div>
                  <div className="inline-flex rounded-md bg-white/10 px-3 py-1.5 text-xs text-white">
                    Browse Files
                  </div>
                </div>
              ) : (
                <img
                  src={productPreview}
                  alt="Product preview"
                  className="h-40 w-40 rounded-lg object-cover"
                />
              )}
            </label>
          </div>

          {/* Select Virtual Model */}
          <div className="rounded-2xl border border-gray-700/60 bg-white/5 p-4">
            <h3 className="text-sm font-medium text-gray-100 mb-3">Select Virtual Model</h3>

            <label className="block text-xs text-gray-300 mb-1">Choose a Model</label>
            <div className="flex items-center gap-2">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "female" | "male")}
                className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-gray-100"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            {/* Thumbnails, scroll to see more */}
            <div className="mt-3 grid grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChooseModel(m.id)}
                  className={classNames(
                    "overflow-hidden rounded-md border bg-white/5",
                    selectedModelId === m.id ? "ring-2 ring-blue-500" : "border-gray-700"
                  )}
                  title={m.label}
                >
                  <img src={m.imgUrl} alt={m.label} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Generate Options */}
          <div className="rounded-2xl border border-gray-700/60 bg-white/5 p-4">
            <h3 className="text-sm font-medium text-gray-100 mb-3">Generate Options</h3>

            <label className="block text-xs text-gray-300 mb-1">Number of Images (1–5)</label>
            <div className="inline-flex items-center gap-3 rounded-md border border-gray-700 px-3 py-2">
              <button
                type="button"
                onClick={() => changeCount(-1)}
                className="h-7 w-7 rounded-md bg-white/10 text-white hover:bg-white/20"
              >
                –
              </button>
              <span className="min-w-6 text-center text-white">{count}</span>
              <button
                type="button"
                onClick={() => changeCount(1)}
                className="h-7 w-7 rounded-md bg-white/10 text-white hover:bg-white/20"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || loading}
              className="mt-4 w-full rounded-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {loading ? "Generating…" : "Generate Try-On Images"}
            </button>

            {error && (
              <div className="mt-3 rounded-md border border-red-700 bg-red-900/30 p-3 text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Results */}
        <div className="rounded-2xl border border-gray-700/60 bg-white/5 p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Virtual Try-On Results</h2>
          {results.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-gray-700 bg-white/5">
              <div className="text-center text-gray-300">
                <div className="mb-2 text-2xl">🖼</div>
                <div className="text-sm">Your generated try-on images will appear here.</div>
                <div className="text-xs text-gray-400 mt-1">
                  Upload a product, select a model, and click "Generate".
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {results.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-gray-700">
                  <img src={url} alt={`Result ${i + 1}`} className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}