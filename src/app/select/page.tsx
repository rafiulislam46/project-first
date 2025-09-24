"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import {
  cn,
  fadeUp,
  staggerContainer,
  getSelectedModelId,
  setSelectedModelId,
  getSelectedTemplateId,
  setSelectedTemplateId,
} from "@/lib/utils";
import { IS_FREE, IS_MOCK } from "@/lib/config";
import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";
import SearchBar from "@/components/ui/search-bar";

/**
 * Combined selection page that shows:
 * - Models section (with gender + style filters)
 * - Templates section (with category filter)
 */

type ModelStyle = { key: string; thumb?: string | null; thumb_url?: string | null };
type Model = { id: string; name: string; gender?: string | null; thumb_url?: string | null; styles?: ModelStyle[] };
type Template = { id: string; name: string; category?: string | null; refUrl?: string | null; thumb?: string | null };

type Gender = "male" | "female" | "all";
type StyleKey = string | "all";
type CategoryKey = string | "all";

function SelectPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  // Models state
  const [models, setModels] = useState<Model[] | null>(null);
  const [modelGender, setModelGender] = useState<Gender>("all");
  const [modelStyle, setModelStyle] = useState<StyleKey>("all");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [qModels, setQModels] = useState("");

  // Templates state
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [templateCategory, setTemplateCategory] = useState<CategoryKey>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [qTemplates, setQTemplates] = useState("");

  // Animations
  const controlsModels = useAnimation();
  const controlsTemplates = useAnimation();

  // Section refs for initial scroll focusing
  const modelsRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Load initial selections
  useEffect(() => {
    setSelectedModel(getSelectedModelId());
    setSelectedTemplate(getSelectedTemplateId());
  }, []);

  // Load data from API
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [modelsRes, templatesRes] = await Promise.all([
          fetch("/api/models", { cache: "no-store" }),
          fetch("/api/templates", { cache: "no-store" }),
        ]);
        const mjson = await modelsRes.json().catch(() => ({ items: [] as Model[] }));
        const tjson = await templatesRes.json().catch(() => ({ items: [] as Template[] }));

        let listModels: Model[] = (mjson.items || []).map((m: Model) => {
          return {
            ...m,
            styles: (m.styles || []) as ModelStyle[],
          };
        });
        if (IS_MOCK && IS_FREE) {
          listModels = listModels.slice(0, 12);
        }

        const listTemplates: Template[] = (tjson.items || []).map((t: Template) => ({
          ...t,
          thumb: t.thumb || "/catalog/templates/template_card.svg",
        }));

        if (!ignore) {
          setModels(listModels);
          setTemplates(listTemplates);
        }
      } catch (e) {
        console.error("Failed to load models/templates:", e);
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

  // Derive chips/options
  const modelStyleOptions = useMemo(() => {
    const set = new Set<string>();
    (models || []).forEach((m) => (m.styles || []).forEach((s) => s?.key && set.add(s.key)));
    return ["all", ...Array.from(set).sort()];
  }, [models]);

  const templateCategoryOptions = useMemo(() => {
    const set = new Set<string>();
    (templates || []).forEach((t) => {
      const c = (t.category || "").trim();
      if (c) set.add(c);
    });
    return ["all", ...Array.from(set).sort()];
  }, [templates]);

  // Sidebar items
  const modelSidebarItems: SidebarItem[] = useMemo(
    () =>
      modelStyleOptions.map((s) => ({
        key: s,
        label: s === "all" ? "All Styles" : s,
        count:
          s === "all"
            ? (models || []).length
            : (models || []).filter((m) =>
                (m.styles || []).some((x) => x.key.toLowerCase() === String(s).toLowerCase())
              ).length,
      })),
    [modelStyleOptions, models]
  );

  const templateSidebarItems: SidebarItem[] = useMemo(
    () =>
      templateCategoryOptions.map((c) => ({
        key: c,
        label: c === "all" ? "All Templates" : c[0].toUpperCase() + c.slice(1),
        count:
          c === "all"
            ? (templates || []).length
            : (templates || []).filter(
                (t) => (t.category || "").toLowerCase() === String(c).toLowerCase()
              ).length,
      })),
    [templateCategoryOptions, templates]
  );

  // Filtered lists
  const filteredModels = useMemo(() => {
    if (!models) return null;
    return models.filter((m) => {
      const genderOk = modelGender === "all" || (m.gender || "").toLowerCase() === modelGender;
      const styleOk =
        modelStyle === "all" ||
        (m.styles || []).some((s) => s.key.toLowerCase() === String(modelStyle).toLowerCase());
      const searchOk =
        !qModels.trim() ||
        m.name.toLowerCase().includes(qModels.trim().toLowerCase()) ||
        (m.gender || "").toLowerCase().includes(qModels.trim().toLowerCase());
      return genderOk && styleOk && searchOk;
    });
  }, [models, modelGender, modelStyle, qModels]);

  const filteredTemplates = useMemo(() => {
    if (!templates) return null;
    let base = templates;
    if (templateCategory !== "all") {
      base = base.filter(
        (t) => (t.category || "").toLowerCase() === String(templateCategory).toLowerCase()
      );
    }
    if (qTemplates.trim()) {
      const s = qTemplates.trim().toLowerCase();
      base = base.filter(
        (t) => t.name.toLowerCase().includes(s) || (t.category || "").toLowerCase().includes(s)
      );
    }
    return base;
  }, [templates, templateCategory, qTemplates]);

  useEffect(() => {
    controlsModels.start("show");
  }, [filteredModels, controlsModels]);

  useEffect(() => {
    controlsTemplates.start("show");
  }, [filteredTemplates, controlsTemplates]);

  // Handle deep link to section via ?section=models|templates or hash
  useEffect(() => {
    const section = params.get("section") || (typeof window !== "undefined" ? window.location.hash.replace("#", "") : "");
    const el = section === "templates" ? templatesRef.current : section === "models" ? modelsRef.current : null;
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectAndReturn = (kind: "model" | "template", id: string | null) => {
    if (kind === "model") {
      setSelectedModel(id);
      setSelectedModelId(id);
    } else {
      setSelectedTemplate(id);
      setSelectedTemplateId(id);
    }
    // Go back to the generator (upload) page
    try {
      router.back();
    } catch {
      router.push("/upload");
    }
  };

  return (
    <section className="container py-8 md:py-12 space-y-10">
      {/* Models Section */}
      <motion.div id="models" ref={modelsRef} initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="mb-4 flex items-end justify-between gap-4" variants={fadeUp}>
          <div>
            <h2 className="mb-1">Models</h2>
            <p className="text-text-body">Pick a model (gender/type, thumbnail). Click to select.</p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <SearchBar value={qModels} onChange={setQModels} placeholder="Search models…" className="sm:max-w-xs" />
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "female", "male"] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setModelGender(g)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    modelGender === g ? "bg-accent-1/10 text-text-hi ring-1 ring-accent-1/20" : "text-text-body hover:bg-surface"
                  )}
                >
                  {g[0].toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar items={modelSidebarItems} value={String(modelStyle)} onChange={(k) => setModelStyle(k as StyleKey)} title="Styles" />

          <motion.div
            initial="hidden"
            animate={controlsModels}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
            className="flex-1"
          >
            {/* Scrollable grid container */}
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {!filteredModels && (
                  <motion.div className="text-text-body" variants={fadeUp}>
                    Loading...
                  </motion.div>
                )}
                {filteredModels?.map((m, idx) => {
                  const styleThumb = m.styles?.[0]?.thumb_url || m.styles?.[0]?.thumb;
                  const thumb = m.thumb_url || styleThumb || `/catalog/models/model_card.svg`;

                  const selected = selectedModel === m.id;

                  return (
                    <Card3DTilt
                      key={m.id}
                      index={idx}
                      onClick={() => {
                        const next = selected ? null : m.id;
                        onSelectAndReturn("model", next);
                      }}
                      selected={selected}
                      variants={fadeUp}
                      className={cn("glass-card p-0 overflow-hidden cursor-pointer transition bg-white", IS_MOCK && IS_FREE ? "demo-watermark" : "")}
                    >
                      <div className="relative aspect-[4/3] w-full bg-surface">
                        <img src={thumb as string} alt={m.name} className="h-full w-full object-cover" />
                        {selected && <SelectedBadge className="absolute right-3 top-3" />}
                      </div>
                      <div className="p-5">
                        <h3 className="mb-1">{m.name}</h3>
                        <p className="mb-3 text-xs text-text-body/70">{m.gender ? m.gender : "—"}</p>
                        {m.styles && m.styles.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {m.styles.slice(0, 4).map((s) => (
                              <span key={s.key} className="rounded-md bg-surface px-2 py-1 text-xs text-text-body" title={s.key}>
                                {s.key}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-body text-sm">No styles listed.</p>
                        )}
                      </div>
                    </Card3DTilt>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Templates Section */}
      <motion.div id="templates" ref={templatesRef} initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="mb-4 flex items-end justify-between gap-4" variants={fadeUp}>
          <div>
            <h2 className="mb-1">Templates</h2>
            <p className="text-text-body">Pick a template (name, type, thumbnail). Click to select.</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchBar value={qTemplates} onChange={setQTemplates} placeholder="Search templates…" className="sm:max-w-xs" />
            {IS_FREE && (
              <div className="rounded-xl border bg-white px-3 py-1.5 text-xs text-text-body shadow-sm">Free plan: Some templates are marked Pro</div>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar items={templateSidebarItems} value={String(templateCategory)} onChange={(k) => setTemplateCategory(k as CategoryKey)} />

          <motion.div
            initial="hidden"
            animate={controlsTemplates}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
            className="flex-1"
          >
            {/* Scrollable grid container */}
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {!filteredTemplates && (
                  <motion.div className="text-text-body" variants={fadeUp}>
                    Loading...
                  </motion.div>
                )}
                {filteredTemplates?.map((t, idx) => {
                  const thumb = t.thumb || "/catalog/templates/template_card.svg";
                  const selected = selectedTemplate === t.id;
                  const isPro = IS_MOCK ? idx % 3 === 0 : false;

                  return (
                    <Card3DTilt
                      key={t.id}
                      index={idx}
                      onClick={() => {
                        const next = selected ? null : t.id;
                        onSelectAndReturn("template", next);
                      }}
                      selected={selected}
                      variants={fadeUp}
                      className={cn("glass-card p-0 overflow-hidden cursor-pointer transition bg-white", IS_MOCK && IS_FREE ? "demo-watermark" : "")}
                    >
                      <div className="relative aspect-[4/3] w-full bg-surface">
                        <img src={thumb as string} alt={t.name} className="h-full w-full object-cover" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <Badge kind={isPro ? "pro" : "free"} />
                          {selected && <SelectedBadge />}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="mb-1">{t.name}</h3>
                        <p className="mb-3 text-xs text-text-body/70">{t.category ? t.category : "—"}</p>
                        <div className="flex items-center gap-3">
                          <a href={t.refUrl || "#"} target="_blank" className="text-accent-1/90 hover:text-accent-1 underline underline-offset-2 text-sm">
                            Reference
                          </a>
                          <span className="ml-auto text-[11px] text-text-body">{selected ? "Selected" : "Click to use"}</span>
                        </div>
                      </div>
                    </Card3DTilt>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={null}>
      <SelectPageInner />
    </Suspense>
  );
}

/* 3D tilt + hover scale + glow */
function Card3DTilt({
  children,
  className,
  selected,
  onClick,
  variants,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  variants?: any;
  index?: number;
}) {
  return (
    <motion.div
      variants={variants}
      onClick={onClick}
      className={cn(
        className,
        "relative will-change-transform",
        "transition-transform duration-200 hover:scale-[1.02]",
        selected ? "ring-2 ring-emerald-400/50" : "ring-1 ring-[rgba(15,23,42,0.08)]",
      )}
      style={{
        transformStyle: "preserve-3d",
      }}
      whileHover={{}}
      onMouseMove={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (py - 0.5) * -8; // tilt up/down
        const ry = (px - 0.5) * 8; // tilt left/right
        target.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
        target.style.boxShadow = selected ? "0 8px 30px rgba(16, 185, 129, 0.25)" : "0 8px 30px rgba(2,6,23,0.10)";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.transform = "";
        target.style.boxShadow = "";
      }}
    >
      {children}
      {/* soft glow border */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          selected ? "ring-2 ring-emerald-400/50" : "ring-1 ring-[rgba(15,23,42,0.08)]"
        )}
        style={{ mixBlendMode: "normal" }}
      />
    </motion.div>
  );
}

function Badge({ kind }: { kind: "pro" | "free" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ring-1",
        kind === "pro" ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
      )}
    >
      {kind === "pro" ? "Pro" : "Free"}
    </span>
  );
}

function SelectedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-medium text_white shadow", className)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Selected
    </span>
  );
}