"use client";

import { motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  getSelectedModelId,
  getSelectedTemplateId,
  cn,
} from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IS_MOCK } from "@/lib/config";
import { canGenerate as canUseCredit, useOneCredit, getCredits } from "@/lib/credits";

type Toast = { id: number; type: "success" | "error" | "info"; message: string; actionLabel?: string; action?: () => void };

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

export default function UploadPage() {
  const [selectedModelId, setSelectedModelIdState] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateIdState] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null); // object URL for preview
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null); // base64 for API
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCreditsState] = useState<number | null>(null);

  const { toasts, push, remove } = useToasts();

  useEffect(() => {
    setSelectedModelIdState(getSelectedModelId());
    setSelectedTemplateIdState(getSelectedTemplateId());
  }, []);

  // Load credits for display (mock or supabase-backed)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = await getCredits();
        if (active) setCreditsState(c);
      } catch {
        if (active) setCreditsState(0);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const isImageAcceptable = useCallback((f: File) => {
    return ["image/png", "image/jpeg"].includes(f.type);
  }, []);

  const readAsDataURL = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleFiles = useCallback(
    async (files: FileList | null | undefined) => {
      const f = files?.[0];
      if (!f) return;
      if (!isImageAcceptable(f)) {
        push({ type: "error", message: "Please upload a PNG or JPG image." });
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        push({ type: "error", message: "File too large. Max 10MB." });
        return;
      }
      // preview
      const objUrl = URL.createObjectURL(f);
      setFilePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objUrl;
      });
      setFile(f);
      try {
        const dataUrl = await readAsDataURL(f);
        setFileDataUrl(dataUrl);
      } catch {
        push({ type: "error", message: "Failed to read file. Please try again." });
      }
    },
    [isImageAcceptable, push]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    await handleFiles(e.dataTransfer.files);
  };

  const canGenerate = useMemo(() => {
    return !!file && (!!selectedModelId || !!selectedTemplateId);
  }, [file, selectedModelId, selectedTemplateId]);

  const onGenerate = useCallback(async () => {
    if (!file) {
      push({ type: "error", message: "Please add a product image (PNG or JPG)." });
      return;
    }
    if (!fileDataUrl) {
      push({ type: "error", message: "Image not ready yet. Please wait a moment." });
      return;
    }

    // Credits check (mock mode)
    if (IS_MOCK) {
      const okToProceed = await canUseCredit();
      if (!okToProceed) {
        push({
          type: "error",
          message: "You’ve reached your plan limit. Upgrade to continue.",
          actionLabel: "View Pricing",
          action: () => {
            try {
              window.location.href = "/pricing";
            } catch {}
          },
        });
        return;
      }
    }

    let endpoint: "/api/tryon" | "/api/template" | null = null;
    let payload: any = { productImageUrl: fileDataUrl };
    if (selectedModelId) {
      endpoint = "/api/tryon";
      payload.modelId = selectedModelId;
    } else if (selectedTemplateId) {
      endpoint = "/api/template";
      payload.templateId = selectedTemplateId;
    } else {
      push({ type: "error", message: "Select a model or a template to continue." });
      return;
    }
    if (prompt.trim()) payload.prompt = prompt.trim();

    try {
      setSubmitting(true);

      // Decrement one credit before starting
      if (IS_MOCK) {
        const ok = await useOneCredit();
        if (!ok) {
          push({
            type: "error",
            message: "No credits remaining on your plan.",
            actionLabel: "Upgrade",
            action: () => (window.location.href = "/pricing"),
          });
          return;
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Generation failed. Please try again.";
        try {
          const j = await res.json();
          if (j?.error) msg = String(j.error);
        } catch {}
        push({ type: "error", message: msg });
        return;
      }

      push({ type: "success", message: "Your job has started. Redirecting to results..." });
      window.setTimeout(() => {
        try {
          window.location.href = "/result";
        } catch {}
      }, 800);
    } catch {
      push({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }, [file, fileDataUrl, selectedModelId, selectedTemplateId, prompt, push]);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        {/* Stepper */}
        <motion.div variants={fadeUp} className="mb-5">
          <ol className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: 1, label: "Upload product", href: "/upload", active: true },
              { key: 2, label: "Select model", href: "/select?section=models#models", active: !!selectedModelId },
              { key: 3, label: "Select template", href: "/select?section=templates#templates", active: !!selectedTemplateId },
              { key: 4, label: "Generate", href: "#", active: canGenerate },
            ].map((s, idx) => (
              <li key={idx}>
                <Link
                  href={s.href}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-xs shadow-soft-1 transition hover:bg-white/90",
                    s.active ? "ring-1 ring-accent-1/30 text-text-hi" : "text-text-body"
                  )}
                >
                  <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] border", s.active ? "bg-accent-1/10 border-accent-1/30" : "bg-surface")}>
                    {idx + 1}
                  </span>
                  <span>{s.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.h2 className="mb-2" variants={fadeUp}>
          Upload
        </motion.h2>
        <motion.p className="mb-1 text-text-body" variants={fadeUp}>
          Upload a PNG/JPG product photo. Optionally add a prompt. We’ll use your selected Model or Template.
        </motion.p>
        <motion.p className="mb-4 text-xs text-text-body/70" variants={fadeUp}>
          {IS_MOCK ? `Credits remaining: ${
            credits === null ? "…" : credits === -1 ? "∞" : credits
          }` : ""}
        </motion.p>

        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="mb-2 flex flex-wrap gap-6">
            <div>
              <span className="text-sm text-text-body">Selected model:</span>{" "}
              <span className="text-sm font-medium">{selectedModelId ?? "None"}</span>
            </div>
            <div>
              <span className="text-sm text-text-body">Selected template:</span>{" "}
              <span className="text-sm font-medium">{selectedTemplateId ?? "None"}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <Link href="/select?section=models#models" className="rounded-xl border bg-white px-3 py-1.5 text-xs hover:bg-white/90">Browse models</Link>
              <Link href="/select?section=templates#templates" className="rounded-xl border bg-white px-3 py-1.5 text-xs hover:bg-white/90">Browse templates</Link>
            </div>
          </div>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-6 transition ${
              dragActive ? "ring-2 ring-accent-1/50 bg-white/[0.03]" : "bg-surface/40"
            }`}
          >
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
                  <span className="text-sm text-text-body">
                    Drag and drop your image here, or click to browse
                  </span>
                  <span className="text-xs text-text-body/70">PNG or JPG, up to 10MB</span>
                </>
              ) : (
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
                  <div className="overflow-hidden rounded-xl border">
                    {submitting ? (
                      <div className="flex aspect-square items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-1" />
                      </div>
                    ) : (
                      <img
                        alt="Preview"
                        src={filePreviewUrl}
                        className="aspect-square h-auto w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-text-hi">{file?.name}</p>
                      <p className="text-xs text-text-body/70">
                        {(file?.size ?? 0) > 0 ? `${Math.round((file!.size / 1024 / 1024) * 10) / 10} MB` : ""}
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

          <div className="mt-5">
            <label className="mb-2 block text-sm text-text-body">Optional prompt</label>
            <textarea
              className="input-premium w-full min-h-24 resize-y"
              placeholder="e.g., Studio lighting, minimal shadows, reflective tabletop"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-body/70">
              Step 4: Review selections, then generate 4–6 premium variations.
            </p>
            <button
              className="btn-gradient w-full sm:w-auto"
              onClick={onGenerate}
              disabled={!canGenerate || submitting}
            >
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
            {t.action && t.actionLabel ? (
              <button
                onClick={t.action}
                className="rounded-md px-2 text-xs text-white/90 hover:text-white underline underline-offset-2"
              >
                {t.actionLabel}
              </button>
            ) : null}
            <button
              onClick={() => remove(t.id)}
              className="rounded-md px-2 text-xs text-white/80 hover:text-white"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}