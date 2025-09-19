"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { loadAssetManifest, loadLocalJSON, overrideModelsWithManifest } from "@/lib/utils";
import { IS_MOCK } from "@/lib/config";

type Model = {
  id: string;
  name: string;
  gender?: "male" | "female" | string;
  styles?: { key: string; thumb?: string }[];
};

export default function ModelsPage() {
  const [models, setModels] = useState<Model[] | null>(null);

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

  const list = models;

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