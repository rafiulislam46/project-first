"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion, useAnimation } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  loadAssetManifest,
  loadLocalJSON,
  overrideModelsWithManifest,
  getSelectedModelId,
} from "@/lib/utils";
import { IS_FREE, IS_MOCK } from "@/lib/config";
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
    <section className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
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
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 md:px-6"
            >
              {!filtered && (
                <motion.div className="text-text-body" variants={fadeUp}>
                  Loading...
                </motion.div>
              )}
              {filtered?.map((m) => {
                const thumb =
                  (m.styles && m.styles[0] && m.styles[0].thumb) ||
                  "/catalog/models/model_card.svg";
                const href = (`/generator?item=${encodeURIComponent(m.id)}`) as Route;

                return (
                  <Link key={m.id} href={href} className="block">
                    <img
                      src={thumb}
                      alt={m.name}
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