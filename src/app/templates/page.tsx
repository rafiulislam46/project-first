"use client";

import React, { useEffect, useState } from "react";
import { loadAssetManifest, loadLocalJSON, overrideTemplatesWithManifest } from "@/lib/utils";
import { IS_MOCK } from "@/lib/config";
import Link from "next/link";
import type { Route } from "next";

type Template = { id: string; name: string; category?: string; refUrl?: string; thumb?: string };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);

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

  const list = templates;

  return (
    <section className="w-full">
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-6">
          {!list && <div className="text-text-body">Loading...</div>}
          {list?.map((t) => {
            const thumb = t.thumb || "/catalog/templates/template_card.svg";
            return (
              <Link
                key={t.id}
                href={`/generator?item=${encodeURIComponent(t.id)}` as Route}
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