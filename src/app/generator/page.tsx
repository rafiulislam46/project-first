"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  cn,
  fadeUp,
  staggerContainer,
  loadAssetManifest,
  loadLocalJSON,
  overrideModelsWithManifest,
  overrideTemplatesWithManifest,
  getSelectedModelId,
  getSelectedTemplateId,
  setSelectedModelId,
  setSelectedTemplateId,
} from "@/lib/utils";

type ModelStyle = { key: string; thumb?: string };
type Model = { id: string; name: string; gender?: string; styles?: ModelStyle[] };
type Template = { id: string; name: string; category?: string; refUrl?: string; thumb?: string };

function GeneratorContent() {
  const params = useSearchParams();

  const [models, setModels] = useState<Model[] | null>(null);
  const [templates, setTemplates] = useState<Template[] | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Hydrate existing selections
  useEffect(() => {
    setSelectedModel(getSelectedModelId());
    setSelectedTemplate(getSelectedTemplateId());
  }, []);

  // Load data to resolve ?item
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [modelsLocal, templatesLocal, manifest] = await Promise.all([
          loadLocalJSON<Model[]>(`/data/models.json`),
          loadLocalJSON<Template[]>(`/data/templates.json`),
          loadAssetManifest(),
        ]);
        if (!ignore) {
          setModels(overrideModelsWithManifest(modelsLocal || [], manifest));
          setTemplates(overrideTemplatesWithManifest(templatesLocal || [], manifest));
        }
      } catch {
        if (!ignore) {
          setModels([]);
          setTemplates([]);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Resolve deep link ?item=<id> coming from Models/Templates/Landing cards.
  useEffect(() => {
    const item = params.get("item");
    if (!item) return;
    const id = String(item);
    const trySet = () => {
      const inModels = (models || []).some((m) => m.id === id);
      const inTemplates = (templates || []).some((t) => t.id === id);
      if (inModels) {
        setSelectedModel(id);
        setSelectedModelId(id);
      } else if (inTemplates) {
        setSelectedTemplate(id);
        setSelectedTemplateId(id);
      }
    };
    trySet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, models, templates]);

  const canProceed = useMemo(() => {
    return !!(selectedModel || selectedTemplate);
  }, [selectedModel, selectedTemplate]);

  const primaryActionHref = useMemo(() => {
    return ("/upload" as Route);
  }, []);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Generator
        </motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Follow the steps: upload a product image, select a model or template, then generate variations.
        </motion.p>

        {/* Stepper */}
        <motion.ol className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2" variants={fadeUp}>
          {[
            { key: 1, label: "Upload product", href: "/upload", active: true },
            { key: 2, label: "Select model", href: "/select?section=models#models", active: !!selectedModel },
            { key: 3, label: "Select template", href: "/select?section=templates#templates", active: !!selectedTemplate },
            { key: 4, label: "Generate", href: "#", active: canProceed },
          ].map((s, idx) => (
            <li key={idx}>
              {s.href.startsWith("/") ? (
                <Link
                  href={s.href as Route}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-xs shadow-soft-1 transition hover:bg-white/90",
                    s.active ? "ring-1 ring-accent-1/30 text-text-hi" : "text-text-body"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] border",
                      s.active ? "bg-accent-1/10 border-accent-1/30" : "bg-surface"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span>{s.label}</span>
                </Link>
              ) : (
                <a
                  href={s.href}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-xs shadow-soft-1 transition hover:bg-white/90",
                    s.active ? "ring-1 ring-accent-1/30 text-text-hi" : "text-text-body"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] border",
                      s.active ? "bg-accent-1/10 border-accent-1/30" : "bg-surface"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span>{s.label}</span>
                </a>
              )}
            </li>
          ))}
        </motion.ol>

        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-text-body">Selected model</p>
              <p className="text-sm font-medium">{selectedModel ?? "None"}</p>
            </div>
            <div>
              <p className="text-sm text-text-body">Selected template</p>
              <p className="text-sm font-medium">{selectedTemplate ?? "None"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-text-body/70">
              Tip: You can pick either a model or a template, or both, before uploading.
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href={"/select?section=models#models" as Route} className="rounded-xl border bg-white px-3 py-2 text-xs hover:bg-white/90">
                Browse models
              </Link>
              <Link href={"/select?section=templates#templates" as Route} className="rounded-xl border bg-white px-3 py-2 text-xs hover:bg-white/90">
                Browse templates
              </Link>
              <Link
                href={primaryActionHref}
                className={cn("btn-gradient px-4 py-2 rounded-xl text-center text-white", !canProceed && "opacity-90")}
              >
                Go to Upload
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
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