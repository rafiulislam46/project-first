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
} from "@/lib/utils";
import { IS_FREE, IS_MOCK } from "@/lib/config";
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
    <section className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
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
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 md:px-6"
            >
              {!filtered && (
                <motion.div className="text-text-body" variants={fadeUp}>
                  Loading...
                </motion.div>
              )}
              {filtered?.map((t) => {
                const thumb = t.thumb || "/catalog/templates/template_card.svg";
                const href = (`/generator?item=${encodeURIComponent(t.id)}`) as Route;

                return (
                  <Link key={t.id} href={href} className="block">
                    <img
                      src={thumb}
                      alt={t.name}
                      className="w-full h-48 object-cover rounded-xl shadow hover:scale-105 transition-transform duration-300"
                    />
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