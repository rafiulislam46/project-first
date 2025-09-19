"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  loadAssetManifest,
  loadLocalJSON,
  overrideTemplatesWithManifest,
  getSelectedTemplateId,
  cn,
} from "@/lib/utils";
import { IS_MOCK, IS_FREE } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";
import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";
import SearchBar from "@/components/ui/search-bar";
import Link from "next/link";
import type { Route } from "next";

type Template = { id: string; name: string; category?: string; refUrl?: string; thumb?: string };

type CategoryKey = string | "all";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryKey>("all");
  const [q, setQ] = useState("");
  const controls = useAnimation();

  useEffect(() => {
    setSelectedId(getSelectedTemplateId());
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (IS_MOCK) {
          const [local, manifest] = await Promise.all([
            loadLocalJSON<Template[]>("/data/templates.json"),
            loadAssetManifest(),
          ]);
          const merged = overrideTemplatesWithManifest(local || [], manifest);
          if (!ignore) setTemplates(merged);
        } else {
          if (!ignore) setTemplates([]);
        }
      } catch {
        if (!ignore) setTemplates([]);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    (templates || []).forEach((t) => {
      const c = (t.category || "").trim();
      if (c) set.add(c);
    });
    return ["all", ...Array.from(set).sort()];
  }, [templates]);

  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      categoryOptions.map((c) => ({
        key: c,
        label: c === "all" ? "All Templates" : c[0].toUpperCase() + c.slice(1),
        count:
          c === "all"
            ? (templates || []).length
            : (templates || []).filter(
                (t) => (t.category || "").toLowerCase() === String(c).toLowerCase()
              ).length,
      })),
    [categoryOptions, templates]
  );

  const filtered = useMemo(() => {
    if (!templates) return null;
    let base = templates;
    if (category !== "all") {
      base = base.filter(
        (t) => (t.category || "").toLowerCase() === String(category).toLowerCase()
      );
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      base = base.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          (t.category || "").toLowerCase().includes(s)
      );
    }
    return base;
  }, [templates, category, q]);

  useEffect(() => {
    controls.start("show");
  }, [filtered, controls]);

  return (
    <section className="container py-8 md:py-12">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="mb-6" variants={fadeUp}>
          <h2 className="mb-1">Templates</h2>
          <p className="text-text-body">Start from curated templates and customize to your needs.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar items={sidebarItems} value={String(category)} onChange={(k) => setCategory(k as CategoryKey)} />

          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar value={q} onChange={setQ} placeholder="Search templates…" className="sm:max-w-xs" />
              {IS_FREE && (
                <div className="rounded-xl border bg-white px-3 py-1.5 text-xs text-text-body shadow-sm">
                  Free plan: Some templates are marked Pro
                </div>
              )}
            </div>

            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
              }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {!filtered && (
                <motion.div className="text-text-body" variants={fadeUp}>
                  Loading...
                </motion.div>
              )}
              {filtered?.map((t, idx) => {
                const thumb = t.thumb || "/catalog/templates/template_card.svg";
                const selected = selectedId === t.id;
                const isPro = IS_MOCK ? idx % 3 === 0 : false;
                const href = (`/generator?template=${encodeURIComponent(t.id)}`) as Route;

                return (
                  <Link key={t.id} href={href} className="block">
                    <Card3DTilt
                      index={idx}
                      selected={selected}
                      variants={fadeUp}
                      className={cn(
                        "glass-card p-0 overflow-hidden cursor-pointer transition bg-white",
                        "hover:scale-105",
                        IS_MOCK && IS_FREE ? "demo-watermark" : ""
                      )}
                    >
                      <div className="relative aspect-[4/3] w-full bg-surface">
                        <img src={thumb} alt={t.name} className="h-full w-full object-cover" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <Badge kind={isPro ? "pro" : "free"} />
                          {selected && <SelectedBadge />}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="mb-1">{t.name}</h3>
                        <p className="mb-3 text-xs text-text-body/70">{t.category ? t.category : "—"}</p>
                        <div className="flex items-center gap-3">
                          {t.refUrl && t.refUrl.startsWith("http") ? (
                            <a
                              href={t.refUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-1/90 hover:text-accent-1 underline underline-offset-2 text-sm"
                            >
                              Reference
                            </a>
                          ) : (
                            <span className="text-xs text-text-body/70">No reference</span>
                          )}
                          <span className="ml-auto text-[11px] text-text-body">
                            {selected ? "Selected" : "Click to select"}
                          </span>
                        </div>
                      </div>
                    </Card3DTilt>
                  </Link>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
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
        "transition-transform duration-200",
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
        target.style.boxShadow = selected
          ? "0 8px 30px rgba(16, 185, 129, 0.25)"
          : "0 8px 30px rgba(2,6,23,0.10)";
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
        kind === "pro"
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
      )}
    >
      {kind === "pro" ? "Pro" : "Free"}
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