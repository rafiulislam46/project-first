"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn, fadeUp, staggerContainer } from "@/lib/utils";
import { getClientSupabase } from "@/lib/supabase-browser";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";

/**
 * Catalog model shape stored in Supabase
 */
type CatalogModel = {
  id: string;
  name: string;
  gender?: string;
  thumb_url?: string | null;
  styles?: { key: string; thumb_url?: string | null }[] | null;
};

type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }, []);
  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  return { toasts, push, remove };
}

function GeneratorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { toasts, push, remove } = useToasts();

  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [model, setModel] = useState<CatalogModel | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Read ?item; if missing, keep user on the page and show a hint instead of redirecting
  useEffect(() => {
    const item = params.get("item");
    if (!item) {
      setSelectedModelId(null);
      push({ type: "info", message: "No model selected. Open the Models page to pick one." });
      return;
    }
    setSelectedModelId(String(item));
  }, [params, router, push]);

  // Fetch model details from Supabase
  useEffect(() => {
    let cancelled = false;
    async function loadModel(id: string) {
      try {
        const client = getClientSupabase();
        if (!client) {
          push({ type: "error", message: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." });
          return;
        }
        const { data, error } = await client
          .from("catalog_models")
          .select("id, name, gender, thumb_url, styles")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          push({ type: "error", message: error.message });
          return;
        }
        if (!data) {
          push({ type: "error", message: "Model not found. Redirecting to models…" });
          router.replace("/models");
          return;
        }
        if (!cancelled) setModel(data as CatalogModel);
      } catch (e: any) {
        push({ type: "error", message: e?.message || "Failed to load model." });
      }
    }
    if (selectedModelId) loadModel(selectedModelId);
    return () => {
      cancelled = true;
    };
  }, [selectedModelId, push, router]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const isImageAcceptable = useCallback((f: File) => {
    return ["image/png", "image/jpeg"].includes(f.type);
  }, []);

  // Client-side unsigned Cloudinary upload for garment image (JPG/PNG only)
  const uploadToCloudinary = useCallback(async (blob: Blob): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Upload not configured. Missing Cloudinary env.");
    }
    const form = new FormData();
    form.append("file", blob);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    form.append("folder", "uploads");
    form.append("tags", "generator,garment");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text || res.statusText}`);
    }
    const json = await res.json();
    return String(json.secure_url || json.url || "");
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null | undefined) => {
      const f = files?.[0];
      if (!f) return;
      if (!isImageAcceptable(f)) {
        push({ type: "error", message: "Please upload a PNG or JPG image." });
        return;
      }
      if (f.size > 15 * 1024 * 1024) {
        push({ type: "error", message: "File too large. Max 15MB." });
        return;
      }
      const objUrl = URL.createObjectURL(f);
      setFilePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objUrl;
      });
      setFile(f);
      try {
        const publicUrl = await uploadToCloudinary(f);
        setUploadedUrl(publicUrl);
      } catch (e: any) {
        push({ type: "error", message: e?.message || "Failed to upload image." });
        setUploadedUrl(null);
      }
    },
    [isImageAcceptable, push, uploadToCloudinary]
  );

  const canGenerate = useMemo(() => {
    return !!(selectedModelId && model?.thumb_url && uploadedUrl);
  }, [selectedModelId, model, uploadedUrl]);

  // Generate via /api/tryon and set plain JSON result
  const onGenerate = useCallback(async () => {
    if (!canGenerate || !model?.thumb_url || !uploadedUrl) {
      const msg = "Please select a model and upload a product";
      push({ type: "error", message: msg });
      alert(msg);
      return;
    }
    try {
      setSubmitting(true);
      setResult(null);

      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          human_img: model.thumb_url,
          garm_img: uploadedUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error ? String(data.error) : "Generation failed. Please try again.";
        push({ type: "error", message: msg });
        alert(msg);
        setSubmitting(false);
        return;
      }

      // Ensure we only show a single generated image as required
      if (Array.isArray(data?.images) && data.images.length > 0) {
        setResult({ images: [data.images[0]] });
      } else if (typeof data?.url === "string") {
        setResult({ images: [data.url] });
      } else {
        setResult(data);
      }
    } catch {
      const msg = "Network error. Please try again.";
      push({ type: "error", message: msg });
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [canGenerate, model, uploadedUrl, push]);

  const images: string[] = React.useMemo(() => {
    if (!result) return [];
    if (result.images && Array.isArray(result.images)) {
      return result.images.filter((u: any) => typeof u === "string");
    }
    if (result.url && typeof result.url === "string") {
      return [result.url];
    }
    // Back-compat if backend returns { urls: [...] }
    if (result.urls && Array.isArray(result.urls)) {
      return result.urls.filter((u: any) => typeof u === "string");
    }
    return [];
  }, [result]);

  return (
    <section className="container py-10 md:py-14">
      <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-12">
        {/* Hero */}
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border bg-white px-6 py-10 md:px-10 md:py-14 shadow-soft-1"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-semibold tracking-tight text-gray-900">
              Unleash the Future of Product Visuals with AI
            </h1>
            <p className="mt-3 text-gray-600">
              Leverage advanced AI to transform your product imaging workflow, from virtual try‑ons to stunning ad
              creatives.
            </p>
            <div className="mt-6">
              <a href="#tool" className="btn-gradient inline-flex gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M12 19l-4-4M12 19l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Start Generating
              </a>
            </div>
          </div>
        </motion.div>

        {/* Core capabilities */}
        <motion.div variants={fadeUp} className="space-y-3 text-center">
          <h2 className="text-gray-900">Our Core AI Capabilities</h2>
          <p className="text-gray-600">
            Explore the powerful tools designed to elevate your product presentation and marketing efforts.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI Product Imaging",
                desc:
                  "Generate high‑resolution, pixel‑perfect images of your products in diverse settings and styles.",
                icon: (
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 10l3 3 3-3 4 5H5l3-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "Virtual Try‑On",
                desc:
                  "Place your products on AI‑generated models, visualizing items realistically before purchase.",
                icon: (
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 20c2-4 6-6 8-6s6 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "AI Ad Generation",
                desc:
                  "Instantly create compelling ad creatives optimized for platforms and target audiences.",
                icon: (
                  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((card, idx) => (
              <div key={idx} className="rounded-2xl border bg-white p-6 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
                    {card.icon}
                  </div>
                  <h3 className="text-gray-900">{card.title}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
                <a href="#tool" className="mt-3 inline-flex items-center gap-2 text-indigo-600 text-sm">
                  Learn More
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h10M15 12l-3-3M15 12l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Generator tool (kept functional) */}
        <motion.div id="tool" initial="hidden" animate="show" variants={fadeUp} className="space-y-4">
          <h2 className="text-gray-900">AI Tool</h2>
          <p className="text-gray-600">
            Select a model, upload your product image, then generate styled mockups.
          </p>

          {/* Model header */}
          <div className="mb-2 flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-lg border bg-white">
              {model?.thumb_url ? (
                <Image
                  src={model.thumb_url}
                  alt={model?.name || "Model"}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">No image</div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Selected model</div>
              <div className="text-sm font-medium text-gray-900">{model?.name || selectedModelId || "None"}</div>
            </div>
            <div className="ml-auto flex gap-2">
              <Link
                href={"/models" as Route}
                className="rounded-xl border bg-white px-3 py-2 text-xs text-indigo-600 hover:text-indigo-700 hover:border-indigo-600"
              >
                Change model
              </Link>
            </div>
          </div>

          {/* Upload card */}
          <div className="rounded-3xl border bg-white p-6 shadow-soft-1">
            <div className="mb-3 text-sm text-gray-600">Product image (PNG/JPG)</div>
            <div className={cn("relative rounded-2xl border border-dashed bg-indigo-50/40 p-4")}>
              <input
                id="file-input"
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={submitting}
              />
              <label
                htmlFor="file-input"
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 text-center"
              >
                {!filePreviewUrl ? (
                  <>
                    <span className="text-sm text-gray-600">Click to upload or drag‑and‑drop your image here</span>
                    <span className="text-xs text-gray-500">PNG or JPG, up to 15MB</span>
                  </>
                ) : (
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
                    <div className="overflow-hidden rounded-xl border bg-white">
                      {submitting ? (
                        <div className="flex aspect-square items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                        </div>
                      ) : (
                        <img alt="Preview" src={filePreviewUrl} className="aspect-square h-auto w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">{file?.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file?.size ?? 0) > 0 ? `${Math.round((file!.size / 1024 / 1024) * 10) / 10} MB` : ""}
                        </p>
                        <p className="text-xs text-gray-500">{uploadedUrl ? "Uploaded to Cloudinary" : "Uploading…"}</p>
                      </div>
                      {submitting && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="h-24 rounded-xl bg-indigo-50 animate-pulse" />
                          <div className="h-24 rounded-xl bg-indigo-50 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">Step 4: Click Generate to see 3–5 styled mockup results.</p>
              <button className="btn-gradient w-full sm:w-auto" onClick={onGenerate} disabled={!canGenerate || submitting}>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-indigo-200" />
                    Generating…
                  </span>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((u, i) => (
                  <div key={`${u}_${i}`} className="rounded-xl overflow-hidden border bg-white">
                    <img src={u} alt={`Generated ${i + 1}`} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            ) : submitting ? (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                Generating…
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Process steps */}
        <motion.div variants={fadeUp} className="rounded-3xl border bg-white p-6 md:p-8">
          <div className="text-center">
            <h2 className="text-gray-900">How Our AI Transforms Your Vision</h2>
            <p className="mt-2 text-gray-600">
              Our intuitive process makes high‑quality visual content creation accessible to everyone.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { n: "1", t: "Upload Your Product", d: "Easily upload product images from your device. Supports PNG/JPG." },
              { n: "2", t: "Select AI Enhancements", d: "Choose from virtual models, templates, and style presets." },
              { n: "3", t: "Generate & Download", d: "Witness instant results and download in various formats." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-white p-6">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                  {s.n}
                </div>
                <h3 className="mt-3 text-gray-900">{s.t}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA banner */}
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border bg-white px-6 py-10 md:px-10 md:py-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-gray-900">Ready to Elevate Your Visuals?</h2>
            <p className="mt-2 text-gray-600">
              Join the AI Product Studio community and start creating breathtaking product content today.
            </p>
            <div className="mt-6">
              <Link href={"/signup" as Route} className="btn-gradient inline-flex gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M12 19l-4-4M12 19l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Sign Up for Free
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-md ${
              t.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-100"
                : t.type === "error"
                ? "bg-red-500/15 border-red-500/30 text-red-100"
                : "bg-white/10 border-white/20 text-white"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current"></div>
            <div className="flex-1 text-sm">{t.message}</div>
            <button onClick={() => remove(t.id)} className="rounded-md px-2 text-xs text-white/80 hover:text-white">
              Close
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneratorContent />
    </Suspense>
  );
}