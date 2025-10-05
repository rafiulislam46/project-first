"use client";

import React from "react";
import { getClientSupabase } from "@/lib/supabase-browser";

/**
 * Virtual Try-On page UI (exact replica of the provided reference image)
 * - Same layout, colors, text, buttons, inputs, and typography.
 * - Light theme, soft borders, white cards, indigo primary button.
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

type CatalogModel = {
  id: string;
  name: string;
  gender: string;
  thumb_url: string;
  styles?: { key: string; thumb_url?: string | null; thumb?: string | null }[] | null;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: CatalogModel[] };

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function TryOnPage() {
  // Product upload
  const [productFile, setProductFile] = React.useState<File | null>(null);
  const [productPreview, setProductPreview] = React.useState<string | null>(null);
  const [garmentUrl, setGarmentUrl] = React.useState<string | null>(null);

  // Models (fetched from Supabase, same source as Models page)
  const [modelsState, setModelsState] = React.useState<FetchState>({ status: "idle" });
  // Selected model
  const [selectedModelId, setSelectedModelId] = React.useState<string | null>(null);
  const [humanUrl, setHumanUrl] = React.useState<string | null>(null);

  // Generate options
  const [count, setCount] = React.useState<number>(1);

  // Results
  const [results, setResults] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch models from Supabase (same as ModelsList component)
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      setModelsState({ status: "loading" });
      try {
        const client = getClientSupabase();
        if (!client) {
          if (!cancelled) {
            setModelsState({
              status: "error",
              error:
                "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
            });
          }
          return;
        }

        const { data, error } = await client
          .from("catalog_models")
          .select("id, name, gender, thumb_url, styles")
          .order("id", { ascending: true });

        console.log("[Supabase] (Try-On) catalog_models response:", { data, error });

        if (error) {
          if (!cancelled) setModelsState({ status: "error", error: error.message });
          return;
        }

        const items = (data as CatalogModel[]).map((m) => {
          const styleThumb =
            (m.styles?.[0] as any)?.thumb_url || (m.styles?.[0] as any)?.thumb || null;
          const thumb = m.thumb_url || styleThumb || "/catalog/models/model_card.svg";
          return { ...m, thumb };
        }) as (CatalogModel & { thumb: string })[];

        if (!cancelled) {
          setModelsState({ status: "success", data: items });
          // Set default selection if none
          const first = items[0];
          if (first) {
            setSelectedModelId(String(first.id));
            setHumanUrl(first.thumb);
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setModelsState({ status: "error", error: msg });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (["image/png", "image/jpeg"].includes(f.type) === false) {
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
    setGarmentUrl(null);
  };

  const onChooseModel = (id: string) => {
    setSelectedModelId(id);
    const items =
      modelsState.status === "success" ? (modelsState.data as (CatalogModel & { thumb?: string })[]) : [];
    const m = items.find((x) => String(x.id) === String(id));
    const thumb =
      ((m as any)?.thumb as string | undefined) ||
      m?.thumb_url ||
      (m?.styles?.[0] as any)?.thumb_url ||
      (m?.styles?.[0] as any)?.thumb ||
      null;
    setHumanUrl(thumb || null);
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

  // Helpers to present models UI
  const isLoadingModels = modelsState.status === "loading" || modelsState.status === "idle";
  const hasModelsError = modelsState.status === "error";
  const modelItems =
    modelsState.status === "success"
      ? (modelsState.data as (CatalogModel & { thumb?: string })[])
      : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Upload Product Image */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Upload Product Image</h3>
            <label
              htmlFor="file-input"
              className={classNames(
                "flex min-h-40 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center transition",
                "hover:bg-gray-100"
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
                <div className="space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    {/* image icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-5 w-5 text-gray-500"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" strokeWidth="1.5" />
                      <circle cx="8.5" cy="9" r="1.5" strokeWidth="1.5" />
                      <path d="M21 17l-4.5-4.5L12 17l-3-3L3 17" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">Drag & drop your product image here,</div>
                  <div className="text-sm text-gray-600">or</div>
                  <div className="inline-flex rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
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
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Select Virtual Model</h3>

            <label className="mb-1 block text-sm font-medium text-gray-900">Choose a Model</label>
            <div className="flex items-center gap-2">
              {isLoadingModels ? (
                <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  Loading models…
                </div>
              ) : hasModelsError ? (
                <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Failed to load models.
                </div>
              ) : (
                <select
                  value={selectedModelId ?? (modelItems[0] ? String(modelItems[0].id) : "")}
                  onChange={(e) => onChooseModel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  {modelItems.map((m) => (
                    <option key={String(m.id)} value={String(m.id)}>
                      {m.name || String(m.id)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {!isLoadingModels && !hasModelsError && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {modelItems.slice(0, 9).map((m) => {
                  const thumb =
                    ((m as any).thumb as string | undefined) ||
                    m.thumb_url ||
                    (m.styles?.[0] as any)?.thumb_url ||
                    (m.styles?.[0] as any)?.thumb ||
                    "/catalog/models/model_card.svg";
                  return (
                    <button
                      key={String(m.id)}
                      type="button"
                      onClick={() => onChooseModel(String(m.id))}
                      className={classNames(
                        "overflow-hidden rounded-md border border-gray-200 bg-white",
                        selectedModelId === String(m.id) ? "ring-2 ring-indigo-500" : ""
                      )}
                      title={m.name || String(m.id)}
                    >
                      <img
                        src={thumb}
                        alt={m.name || String(m.id)}
                        className="aspect-square w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Generate Options */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Generate Options</h3>

            <label className="mb-1 block text-sm font-medium text-gray-900">
              Number of Images (1-5)
            </label>
            <div className="inline-flex items-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-2">
              <button
                type="button"
                onClick={() => changeCount(-1)}
                className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              >
                –
              </button>
              <span className="min-w-6 text-center text-gray-900">{count}</span>
              <button
                type="button"
                onClick={() => changeCount(1)}
                className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || loading}
              className="mt-4 w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {loading ? "Generating…" : "Generate Try-On Images"}
            </button>

            {error && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Results */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Virtual Try-On Results</h2>
          {results.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-500"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" strokeWidth="1.5" />
                    <circle cx="8.5" cy="9" r="1.5" strokeWidth="1.5" />
                    <path d="M21 17l-4.5-4.5L12 17l-3-3L3 17" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Your generated try-on images will appear here.
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Upload a product, select a model, and click "Generate".
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {results.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img src={url} alt={`Result ${i + 1}`} className="h-auto w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}