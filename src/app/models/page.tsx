"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { IS_MOCK } from "@/lib/config";
import { useEffect, useState } from "react";

type ModelStyle = { key: string; thumb?: string };
type Model = { id: string; name: string; gender?: string; styles?: ModelStyle[] };

export default function ModelsPage() {
  const [models, setModels] = useState<Model[] | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (IS_MOCK) {
          const res = await fetch("/data/models.json", { cache: "no-store" });
          const data = (await res.json()) as Model[];
          if (!ignore) setModels(data);
        } else {
          // live mode placeholder (to be implemented in a later ticket)
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

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Models
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Available models and their capabilities.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
          {!models && (
            <motion.div className="text-text-body" variants={fadeUp}>
              Loading...
            </motion.div>
          )}
          {models?.map((m) => (
            <motion.div key={m.id} className="glass-card p-6" variants={fadeUp}>
              <h3 className="mb-1">{m.name}</h3>
              <p className="text-xs text-text-body/70 mb-3">{m.gender ? m.gender : "—"}</p>
              {m.styles && m.styles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {m.styles.slice(0, 4).map((s) => (
                    <span
                      key={s.key}
                      className="rounded-md bg-white/5 px-2 py-1 text-xs text-text-body"
                      title={s.key}
                    >
                      {s.key}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-body text-sm">No styles listed.</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}