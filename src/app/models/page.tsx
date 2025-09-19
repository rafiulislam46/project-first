"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion, useAnimation } from "framer-motion";
import {
  cn,
  fadeUp,
  staggerContainer,
  loadAssetManifest,
  loadLocalJSON,
  overrideModelsWithManifest,
  getSelectedModelId,
} from "@/lib/utils";
import { IS_MOCK, IS_FREE } from "@/lib/config";
import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";
import SearchBar from "@/components/ui/search-bar";

type Model = {
  id: string;
  name: string;
  gender?: "male" | "female" | string;
  styles?: { key: string; thumb?: string }[];
};

type CategoryKey = "all" | "male" | "female";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryKey>("all");
  const [q, setQ] = useState("");
  const controls = useAnimation();

  useEffect(() => {
    setSelectedId(getSelectedModelId());
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (IS_MOCK) {
          const [local, manifest] = await Promise.all([
            loadLocalJSON<Model[]>("/data/models.json"),
            loadAssetManifest(),
          ]);
          const merged = overrideModelsWithManifest(local || [], manifest);
          if (!ignore) setModels(merged);
        } else {
          if (!ignore) setModels([]);
        }
      } catch {
        if (!ignore) setModels([]);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const sidebarItems: SidebarItem[] = useMemo(() => {
    const counts = {
      all: (models || []).length,
      male: (models || []).filter((m) => (m.gender || "").toLowerCase() === "male").length,
      female: (models || []).filter((m) => (m.gender || "").toLowerCase() === "female").length,
    };
    return [
      { key: "all", label: "All Models", count: counts.all },
      { key: "female", label: "Female", count: counts.female },
      { key: "male", label: "Male", count: counts.male },
    ];
  }, [models]);

  const filtered = useMemo(() => {
    if (!models) return null;
    let base = models;
    if (category !== "all") {
      base = base.filter((m) => (m.gender || "").toLowerCase() === category);
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      base = base.filter((m) => m.name.toLowerCase().includes(s));
    }
    return base;
  }, [models, category, q]);

  useEffect(() => {
    controls.start("show");
  }, [filtered, controls]);

  return (
    <section className="container py-8 md:py-12">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="mb-6" variants={fadeUp}>
          <h2 className="mb-1">Models</h2>
          <p className="text-text-body">Choose a model to start your generation.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar
            items={sidebarItems}
            value={String(category)}
            onChange={(k) => setCategory(k as CategoryKey)}
            title="Gender"
          />

          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar value={q} onChange={setQ} placeholder="Search models…" className="sm:max-w-xs" />
              {IS_FREE && (
                <div className="rounded-xl border bg-white px-3 py-1.5 text-xs text-text-body shadow-sm">
                  Free plan: Some styles are marked Pro
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
              {filtered?.map((m, idx) => {
                const thumb =
                  (m.styles && m.styles[0] && m.styles[0].thumb) ||
                  "/catalog/models/model_card.svg";
                const selected = selectedId === m.id;
                const isPro = IS_MOCK ? idx % 4 === 0 : false;
                const href = (`/generator?model=${encodeURIComponent(m.id)}`) as Route;

                return (
                  <Link key={m.id} href={href} className="block">
                    <Card3DTilt
                      index={idx}
                      selected={selected}
                      variants={fadeUp}
                      className={cn(
                        "glass-card p-0 overflow-hidden cursor-pointer transition bg-white",
                        "hover:scale-105"
                      )}
                    >
                      <div className="relative aspect-[4/3] w-full bg-surface">
                        <img src={thumb} alt={m.name} className="h-full w-full object-cover" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <Badge kind={isPro ? "pro" : "free"} />
                          {selected && <SelectedBadge />}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="mb-1">{m.name}</h3>
                        <p className="text-xs text-text-body/70 capitalize">
                          {(m.gender || "—").toString()}
                        </p>
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

/* 3D tilt + hover scale + glow (same pattern as templates) */
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