"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { loadAssetManifest, loadLocalJSON, overrideModelsWithManifest } from "@/lib/utils";
import { IS_MOCK } from "@/lib/config";
import ModelsList from "@/components/ModelsList";

type Model = {
  id: string;
  name: string;
  gender?: "male" | "female" | string;
  styles?: { key: string; thumb?: string }[];
};

export default function ModelsPage() {
  // Keep mock flow for local development; otherwise show live Supabase-backed list
  const [models, setModels] = useState<Model[] | null>(null);

  useEffect(() => {
    if (!IS_MOCK) return;

    let ignore = false;
    async function load() {
      try {
        const [local, manifest] = await Promise.all([
          loadLocalJSON<Model[]>("/data/models.json"),
          loadAssetManifest(),
        ]);

        // Debug logging for models.json path
        console.log("[Mock] Loaded models.json:", local);
        console.log("[Mock] Loaded asset manifest:", manifest);

        const merged = overrideModelsWithManifest(local || [], manifest);
        if (!ignore) setModels(merged);
      } catch (e) {
        console.warn("[Mock] Failed to load models.json or manifest:", e);
        if (!ignore) setModels([]);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const list = useMemo(() => models, [models]);

  if (!IS_MOCK) {
    // Live mode: use Supabase-backed component with robust error handling
    return (
      <section className="w-full">
        <ModelsList />
      </section>
    );
  }

  // Mock mode: render local JSON-backed grid (with safe fallback)
  return (
    <section className="w-full">
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-6">
          {!list && <div className="text-text-body">Loading...</div>}
          {list?.map((m) => {
            const thumb =
              (m.styles && m.styles[0] && m.styles[0].thumb) ||
              "/catalog/models/model_card.svg";
            return (
              <Link
                key={m.id}
                href={`/generator?item=${encodeURIComponent(m.id)}` as Route}
                className="block"
              >
                <img
                  src={thumb}
                  alt="Template"
                  className="w-full h-48 object-cover rounded-xl shadow hover:scale-105 transition-transform duration-300"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}