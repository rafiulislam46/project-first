"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, loadAssetManifest, loadLocalJSON, overrideTemplatesWithManifest } from "@/lib/utils";
import { IS_MOCK, IS_FREE } from "@/lib/config";
import { useEffect, useState } from "react";

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

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Templates
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Start from curated templates and customize to your needs.
        </motion.p>

        <motion.div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3" variants={staggerContainer}>
          {!templates && (
            <motion.div className="text-text-body" variants={fadeUp}>
              Loading...
            </motion.div>
          )}
          {templates?.map((t) => {
            const thumb = t.thumb || "/catalog/templates/template_card.svg";
            return (
              <motion.div key={t.id} className={"glass-card p-0 overflow-hidden " + (IS_MOCK && IS_FREE ? "demo-watermark" : "")} variants={fadeUp}>
                <div className="aspect-[4/3] w-full bg-black/20">
                  <img src={thumb} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="mb-2">{t.name}</h3>
                  <p className="text-text-body text-sm mb-2">{t.category ? t.category : "—"}</p>
                  <div className="flex items-center gap-3">
                    <a
                      href={t.refUrl || "#"}
                      target="_blank"
                      className="text-accent-1/80 hover:text-accent-1 underline underline-offset-2 text-sm"
                    >
                      Reference
                    </a>
                    <button className="btn-gradient ml-auto">Use template</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}