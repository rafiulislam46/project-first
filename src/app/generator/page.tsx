"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  cn,
  fadeUp,
  staggerContainer,
} from "@/lib/utils";
import { getClientSupabase } from "@/lib/supabase-browser";
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from "@/lib/cloudinary";

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
  const [results, setResults] = useState<string[]>([]);
  const [pollId, setPollId] = useState<string | null>(null);

  // Read ?item and redirect if missing
  useEffect(() => {
    const item = params.get("item");
    if (!item) {
      // No model provided -> redirect to /models
      router.replace("/models");
      return;
    }
    setSelectedModelId(String(item));
  }, [params, router]);

  // Fetch model details from Supabase
  useEffect(() => {
    let cancelled = false;
    async function loadModel(id: string) {
      try {
        const client = getClientSupabase();
        if (!client) {
          // Allow page to render but show a friendly message
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
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const form = new FormData();
    form.set("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    form.set("folder", "uploads");
    form.set("tags", "generator,garment");
    form.set("file", blob, "product.png");

    const res = await fetch(url, { method: "POST", body: form });
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

  // Generate via Replicate idm-vton through our /api/tryon
  const onGenerate = useCallback(async () => {
    if (!canGenerate || !model?.thumb_url || !uploadedUrl) {
      push({ type: "error", message: "Please select a model and upload a product image." });
      return;
    }
    try {
      setSubmitting(true);
      setResults([]);
      setPollId(null);

      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          human_img: model.thumb_url, // model image from Supabase
          garm_img: uploadedUrl,      // garment/product image uploaded by user
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && data.error) ? String(data.error) : "Generation failed. Please try again.";
        push({ type: "error", message: msg });
        setSubmitting(false);
        return;
      }

      const pid = data?.id ? String(data.id) : null;
      if (!pid) {
        // If output already present, show it immediately
        const out = data?.output;
        const urls = Array.isArray(out) ? out.filter((x: any) => typeof x === "string") : (typeof out === "string" ? [out] : []);
        if (urls.length) {
          setResults(urls.slice(0, 5));
        } else {
          push({ type: "error", message: "No output returned from Replicate." });
        }
        setSubmitting(false);
        return;
      }

      setPollId(pid);
    } catch {
      push({ type: "error", message: "Network error. Please try again." });
      setSubmitting(false);
    }
  }, [canGenerate, model, uploadedUrl, push]);

  // Poll /api/tryon?id=... for completion
  useEffect(() => {
    if (!pollId) return;
    let cancelled = false;
    let delay = 1200;
    const startedAt = Date.now();
    const timeoutMs = 120_000;

    async function poll() {
      if (!pollId) return;
      if (Date.now() - startedAt > timeoutMs) {
        push({ type: "error", message: "Generation timed out. Please try again." });
        setSubmitting(false);
        return;
      }
      try {
        const resp = await fetch(`/api/tryon?id=${encodeURIComponent(pollId)}`, { cache: "no-store" });
        const data = await resp.json().catch(() => null);
        if (!resp.ok) {
          push({ type: "error", message: data?.error ? String(data.error) : "Polling error." });
          setSubmitting(false);
          return;
        }
        const status = data?.status;
        if (status === "succeeded") {
          const out = data?.output;
          const urls = Array.isArray(out) ? out.filter((x: any) => typeof x === "string") : (typeof out === "string" ? [out] : []);
          setResults(urls.slice(0, 5));
          setSubmitting(false);
          return;
        }
        if (status === "failed" || status === "canceled") {
          push({ type: "error", message: "Generation failed. Please try another image." });
          setSubmitting(false);
          return;
        }
      } catch {
        // transient errors -> continue polling
      }
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(5000, Math.round(delay * 1.4));
      if (!cancelled) poll();
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [pollId, push]);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Generator
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Select a model, upload your product image, then generate styled mockups.
        </motion.p>

        {/* Model header */}
        <motion.div variants={fadeUp} className="mb-4 flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-lg border bg-white/5">
            {model?.thumb_url ? (
              <Image
                src={model.thumb_url}
                alt={model?.name || "Model"}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-text-body/60">No image</div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm text-text-body">Selected model</div>
            <div className="text-sm font-medium text-text-hi">{model?.name || selectedModelId || "None"}</div>
          </div>
          <div className="ml-auto flex gap-2">
            <Link href={"/models" as Route} className="rounded-xl border bg-white px-3 py-2 text-xs hover:bg-white/90">
              Change model
            </Link>
          </div>
        </motion.div>

        {/* Upload card */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="mb-3 text-sm text-text-body">Product image (PNG/JPG)</div>
          <div className={cn("relative rounded-2xl border border-dashed bg-surface/40 p-4")}>
            <input
              id="file-input"
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={submitting}
            />
            <label htmlFor="file-input" className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 text-center">
              {!filePreviewUrl ? (
                <>
                  <span className="text-sm text-text-body">Click to upload or drag-and-drop your image here</span>
                  <span className="text-xs text-text-body/70">PNG or JPG, up to 15MB</span>
                </>
              ) : (
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
                  <div className="overflow-hidden rounded-xl border">
                    {submitting ? (
                      <div className="flex aspect-square items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-1" />
                      </div>
                    ) : (
                      <img alt="Preview" src={filePreviewUrl} className="aspect-square h-auto w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-text-hi">{file?.name}</p>
                      <p className="text-xs text-text-body/70">
                        {(file?.size ?? 0) > 0 ? `${Math.round((file!.size / 1024 / 1024) * 10) / 10} MB` : ""}
                      </p>
                      <p className="text-xs text-text-body/70">
                        {uploadedUrl ? "Uploaded to Cloudinary" : "Uploading…"}
                      </p>
                    </div>
                    {submitting && (
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-body/70">Step 4: Click Generate to see 3–5 styled mockup results.</p>
            <button className="btn-gradient w-full sm:w-auto" onClick={onGenerate} disabled={!canGenerate || submitting}>
              {submitting ? (
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

        {/* Results */}
        <motion.div variants={fadeUp} className="mt-6">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {results.map((u, i) => (
                <div key={`${u}_${i}`} className="rounded-xl overflow-hidden border bg-white/5">
                  {/* Use plain img to avoid Next Image domain restrictions */}
                  <img src={u} alt={`Result ${i + 1}`} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          ) : submitting ? (
            <div className="flex items-center gap-3 text-sm text-text-body">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent-1" />
              Waiting for Replicate…
            </div>
          ) : null}
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