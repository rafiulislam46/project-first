"use client";

import Link from "next/link";
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
import { ArrowRight } from "lucide-react";

type ModelStyle = { key: string; thumb?: string };
type Model = { id: string; name: string; gender?: string; styles?: ModelStyle[] };
type Template = { id: string; name: string; category?: string; refUrl?: string; thumb?: string };

type PickerItem =
  | ({ kind: "model" } & Model)
  | ({ kind: "template" } & Template);

export default function Page() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Unified picker modal state
  const [openPicker, setOpenPicker] = useState(false);
  const [items, setItems] = useState<PickerItem[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setSelectedModel(getSelectedModelId());
    setSelectedTemplate(getSelectedTemplateId());
  }, []);

  // Load both models and templates (mock/local + manifest override)
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
        return (
          t.name.toLowerCase().includes(s) ||
          (t.category || "").toLowerCase().includes(s)
        );
      }
    });
  }, [items, q]);

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          AI Product Studio
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-2xl text-lg text-text-body"
        >
          Upload your product, choose a model and template, then generate premium styled variations in minutes.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 w-full sm:w-auto"
        >
          <Link href="#features" className="btn-gradient inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3">
            Get Started <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Features section */}
      <section id="features" className="container py-12 md:py-16">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.h2 className="mb-2" variants={fadeUp}>
            Features
          </motion.h2>
          <motion.p className="mb-8 text-text-body" variants={fadeUp}>
            Core steps to create your visuals: upload, pick a model, choose a template, and prompt the generator.
          </motion.p>

          <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer}>
            {/* Upload */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Upload</h3>
              <p className="text-sm text-text-body mb-4">Add your product photo to begin.</p>
              <label className="block">
                <span className="mb-2 block text-xs text-text-body">Choose file</span>
                <input type="file" className="input-premium w-full" />
              </label>
              <Link href="/upload" className="btn-gradient mt-4 inline-block w-full sm:w-auto text-center">Go to Upload</Link>
            </motion.div>

            {/* Unified Model + Template selection */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Model & Template</h3>
              <p className="text-sm text-text-body mb-4">
                Browse models and templates from one place.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border bg-white/5 p-3 text-xs text-text-body">
                  Model: <span className="font-medium text-text-hi">{selectedModel ?? "None"}</span>
                </div>
                <div className="rounded-2xl border bg-white/5 p-3 text-xs text-text-body">
                  Template: <span className="font-medium text-text-hi">{selectedTemplate ?? "None"}</span>
                </div>
              </div>

              <button
                onClick={() => setOpenPicker(true)}
                className={cn("btn-gradient mt-4 w-full sm:w-auto")}
              >
                Browse Items
              </button>
            </motion.div>

            {/* Keep prompt box unchanged */}
            <motion.div className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-2">Prompt</h3>
              <p className="text-sm text-text-body mb-4">
                Describe the desired style or outcome.
              </p>
              <textarea
                className="input-premium w-full h-24 resize-none"
                placeholder="e.g., Soft daylight studio, clean backdrop, premium beauty aesthetic"
              />
              <button className={cn("btn-gradient mt-4 w-full sm:w-auto")}>Generate</button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Dashboard skeleton preview */}
      <section className="container pb-16">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.h2 className="mb-2" variants={fadeUp}>
            Dashboard
          </motion.h2>
          <motion.p className="mb-8 text-text-body" variants={fadeUp}>
            Quick look at your workspace. Visit the dashboard for full details.
          </motion.p>

          <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
            {[
              { title: "Projects", value: 12 },
              { title: "Templates Used", value: 34 },
              { title: "Pending Jobs", value: 2 },
            ].map((c) => (
              <motion.div key={c.title} className="glass-card p-6" variants={fadeUp}>
                <p className="text-sm text-text-body/80">{c.title}</p>
                <p className="text-3xl font-semibold text-text-hi mt-1">{c.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6">
            <Link href="/dashboard" className="btn-gradient inline-block w-full sm:w-auto text-center">Open Dashboard</Link>
          </div>
        </motion.div>
      </section>

      {/* Unified Picker Modal */}
      <AnimatePresence>
        {openPicker && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpenPicker(false)}
            />
            {/* Dialog */}
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
                  onClick={() => setOpenPicker(false)}
                  className="rounded-xl border bg-white/50 px-3 py-2 text-sm hover:bg-white"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {!filtered && (
                  <div className="text-text-body">Loading…</div>
                )}
                {filtered?.map((it, idx) => {
                  const isModel = it.kind === "model";
                  const thumb =
                    isModel
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
                          setSelectedModelId(next);
                        } else {
                          const next = selectedTemplate === it.id ? null : it.id;
                          setSelectedTemplate(next);
                          setSelectedTemplateId(next);
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
    </main>
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