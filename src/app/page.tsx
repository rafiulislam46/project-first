"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  getSelectedModelId,
  getSelectedTemplateId,
  setSelectedModelId,
  setSelectedTemplateId,
  loadAssetManifest,
  loadLocalJSON,
  overrideModelsWithManifest,
  overrideTemplatesWithManifest,
  cn,
} from "@/lib/utils";

type ModelStyle = { key: string; thumb?: string };
type Model = { id: string; name: string; gender?: string; styles?: ModelStyle[] };
type Template = { id: string; name: string; category?: string; refUrl?: string; thumb?: string };

type PickerItem =
  | ({ kind: "model" } & Model)
  | ({ kind: "template" } & Template);

const FILTER_TABS = ["Featured", "Tshirt", "Hoodie", "Book", "Tote Bag"] as const;

export default function Page() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [openPicker, setOpenPicker] = useState(false);
  const [items, setItems] = useState<PickerItem[] | null>(null);
  const [q, setQ] = useState("");

  // For grid filters
  const [activeTab, setActiveTab] = useState<(typeof FILTER_TABS)[number]>("Featured");

  useEffect(() => {
    setSelectedModel(getSelectedModelId());
    setSelectedTemplate(getSelectedTemplateId());
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [modelsLocal, templatesLocal, manifest] = await Promise.all([
          loadLocalJSON<Model[]>("/data/models.json"),
          loadLocalJSON<Template[]>("/data/templates.json"),
          loadAssetManifest(),
        ]);
        const models = overrideModelsWithManifest(modelsLocal || [], manifest).map(
          (m) => ({ ...m, kind: "model" as const })
        );
        const templates = overrideTemplatesWithManifest(templatesLocal || [], manifest).map(
          (t) => ({ ...t, kind: "template" as const })
        );
        if (!ignore) setItems([...models, ...templates]);
      } catch {
        if (!ignore) setItems([]);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const mockups = useMemo(() => {
    // Show only templates in the grid to mimic Mockey's mockups gallery
    const all = (items || []).filter((i) => i.kind === "template") as ({ kind: "template" } & Template)[];
    if (activeTab === "Featured") return all;
    const s = activeTab.toLowerCase();
    return all.filter((t) => {
      const cat = (t.category || "").toLowerCase() + " " + (t.name || "").toLowerCase();
      return cat.includes(s.replace("tshirt", "t-shirt").replace("tote bag", "tote"));
    });
  }, [items, activeTab]);

  return (
    <main className="flex flex-col">
      {/* Hero - Outfits-AI style, split layout with gradient */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100 via-white to-white" />
        <div className="relative max-w-screen-xl mx-auto px-4 md:py-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left: Headline + description + waitlist form */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center text-center md:items-start md:text-left justify-center space-y-4"
            >
              <motion.h1
                variants={fadeUp}
                className="font-semibold tracking-tight text-2xl sm:text-3xl md:text-h1 text-center md:text-left"
              >
                Dress your models with AI
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-sm md:text-body text-text-body max-w-xl"
              >
                Upload an outfit and see it applied to a model in seconds. No photoshoots. No retouching. High‑res exports ready for your store.
              </motion.p>

              {/* Primary CTA: Generate */}
              <motion.div variants={fadeUp} className="w-full flex justify-center">
                <Link
                  href={"/generator" as Route}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-yellow-400 text-white font-bold shadow-lg hover:opacity-90 transition"
                >
                  Generate
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Demo stack (before outfit + after on model) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.05 }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-xl">
                {/* Back card: outfit (before) */}
                <div className="pointer-events-none absolute -left-6 -top-6 hidden md:block">
                  <div className="rounded-2xl border bg-white/90 shadow-soft-2 backdrop-blur overflow-hidden w-44">
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <span className="text-[11px] text-text-body">Outfit</span>
                      <span className="text-[10px] text-text-body/70">Before</span>
                    </div>
                    <img src="/demo/template/1.svg" alt="Outfit before" className="h-40 w-full object-cover" />
                  </div>
                </div>

                {/* Front card: model try-on (after) */}
                <div className="relative rounded-3xl border bg-white shadow-soft-2 overflow-hidden">
                  <img
                    src="/demo/tryon/1.svg"
                    alt="Model wearing outfit"
                    className="w-full h-auto"
                  />
                </div>

                {/* Floating small previews */}
                <div className="pointer-events-none absolute -right-6 bottom-8 hidden md:block">
                  <div className="rounded-2xl border bg-white/90 shadow-soft-2 backdrop-blur overflow-hidden w-28">
                    <img src="/demo/tryon/2.svg" alt="Preview 2" className="h-24 w-full object-cover" />
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-10 -top-6 hidden md:block">
                  <div className="rounded-2xl border bg-white/90 shadow-soft-2 backdrop-blur overflow-hidden w-32">
                    <img src="/demo/tryon/3.svg" alt="Preview 3" className="h-28 w-full object-cover" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Templates grid */}
      <section className="w-full max-w-7xl mx-auto py-6 md:py-8">
        <div className="w-full px-4">
          {!items ? (
            <div className="text-text-body">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {mockups.map((it, idx) => {
                const thumb = it.thumb || "/catalog/templates/template_card.svg";
                const href = (`/generator?item=${it.id}`) as Route;

                return (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.015 * (idx % 10) }}
                    className="overflow-hidden rounded-2xl"
                  >
                    <Link href={href} className="block">
                      <img
                        src={thumb}
                        alt="Template"
                        className="w-full h-48 object-cover rounded-xl shadow hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Unified Picker Modal for selecting model/template (kept for feature parity) */}
      <PickerModal
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        items={items}
        q={q}
        setQ={setQ}
        selectedModel={selectedModel}
        setSelectedModel={(v) => {
          setSelectedModel(v);
          setSelectedModelId(v);
        }}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={(v) => {
          setSelectedTemplate(v);
          setSelectedTemplateId(v);
        }}
      />
    </main>
  );
}

function PickerModal({
  open,
  onClose,
  items,
  q,
  setQ,
  selectedModel,
  setSelectedModel,
  selectedTemplate,
  setSelectedTemplate,
}: {
  open: boolean;
  onClose: () => void;
  items: PickerItem[] | null;
  q: string;
  setQ: (s: string) => void;
  selectedModel: string | null;
  setSelectedModel: (v: string | null) => void;
  selectedTemplate: string | null;
  setSelectedTemplate: (v: string | null) => void;
}) {
  const filtered = useMemo(() => {
    if (!items) return null;
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter((it) => {
      if (it.kind === "model") {
        const m = it as PickerItem & { kind: "model" };
        return (
          m.name.toLowerCase().includes(s) ||
          (m.gender || "").toLowerCase().includes(s) ||
          (m.styles || []).some((st) => st.key.toLowerCase().includes(s))
        );
      } else {
        const t = it as PickerItem & { kind: "template" };
        return t.name.toLowerCase().includes(s) || (t.category || "").toLowerCase().includes(s);
      }
    });
  }, [items, q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-5xl rounded-2xl border bg-white p-4 shadow-soft-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-h3 flex-1">Browse Items</h3>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search models and templates…"
                className="input-premium h-10 w-full max-w-xs"
              />
              <button
                onClick={onClose}
                className="rounded-xl border bg-white/50 px-3 py-2 text-sm hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {!filtered && <div className="text-text-body">Loading…</div>}
              {filtered?.map((it, idx) => {
                const isModel = it.kind === "model";
                const thumb = isModel
                  ? (it.styles?.[0]?.thumb || "/catalog/models/model_card.svg")
                  : (it.thumb || "/catalog/templates/template_card.svg");

                const isSelected =
                  (isModel && selectedModel === it.id) ||
                  (!isModel && selectedTemplate === it.id);

                return (
                  <motion.button
                    key={`${it.kind}:${it.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    onClick={() => {
                      if (isModel) {
                        const next = selectedModel === it.id ? null : it.id;
                        setSelectedModel(next);
                      } else {
                        const next = selectedTemplate === it.id ? null : it.id;
                        setSelectedTemplate(next);
                      }
                    }}
                    className={cn(
                      "group overflow-hidden rounded-2xl border bg-white text-left transition",
                      isSelected ? "ring-2 ring-emerald-400/50" : "ring-1 ring-[rgba(15,23,42,0.08)]"
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full bg-surface">
                      <img src={thumb} alt={it.name} className="h-full w-full object-cover" />
                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <TypeBadge kind={it.kind} />
                        {isSelected && <SelectedBadge />}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-text-hi">{it.name}</p>
                      <p className="text-xs text-text-body mt-1">
                        {isModel
                          ? (it.gender ? `Model • ${it.gender}` : "Model")
                          : (it.category ? `Template • ${it.category}` : "Template")}
                      </p>
                      <div className="mt-3 text-right">
                        <span className="text-[11px] text-text-body/80 group-hover:text-text-hi transition">
                          {isSelected ? "Selected" : "Click to select"}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypeBadge({ kind }: { kind: "model" | "template" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ring-1",
        kind === "model"
          ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
          : "bg-rose-50 text-rose-700 ring-rose-200"
      )}
    >
      {kind === "model" ? "Model" : "Template"}
    </span>
  );
}

function SelectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-medium text-white shadow">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Selected
    </span>
  );
}