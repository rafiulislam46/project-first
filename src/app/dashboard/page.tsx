"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { listSaved, type SavedItem, removeFavorite } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DashboardPage() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setItems(listSaved());
  }, []);

  const handleRemove = (id: string) => {
    removeFavorite(id);
    setItems(listSaved());
  };

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Dashboard
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Your saved favorites appear below. Come back anytime to download them.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={staggerContainer}>
          {[
            { title: "Favorites", value: items.length },
            { title: "Templates Used", value: 34 },
            { title: "Pending Jobs", value: 2 },
          ].map((c) => (
            <motion.div key={c.title} className="glass-card p-6" variants={fadeUp}>
              <p className="text-sm text-text-body/80">{c.title}</p>
              <p className="text-3xl font-semibold text-text-hi mt-1">{c.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="mt-8 glass-card p-6" variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-h3">Saved Favorites</h3>
            <p className="text-xs text-text-body/70">{items.length} item(s)</p>
          </div>
          {items.length === 0 ? (
            <p className="text-text-body">No favorites yet. Save any variation from the Result page.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((it) => (
                <div key={it.id} className="group relative overflow-hidden rounded-2xl border bg-white/5">
                  <img src={it.src} alt={it.id} className="w-full h-full object-cover aspect-[4/5]" />
                  <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition">
                    <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 backdrop-blur">
                      <span className="text-[10px] uppercase tracking-wide text-white/80">{it.kind}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(it.id)} className="h-7 px-2 text-white/90">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}