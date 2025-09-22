"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Template = {
  id: string;
  title: string;
  category: string;
  image: string;
};

const initial: Template[] = [
  { id: "tpl_1", title: "Streetwear Model", category: "Fashion", image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=800&auto=format&fit=crop" },
  { id: "tpl_2", title: "Studio Headshot", category: "Portrait", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop" },
];

export default function TemplatesPage() {
  const [items, setItems] = useState<Template[]>(initial);
  const [form, setForm] = useState<Omit<Template, "id">>({ title: "", category: "", image: "" });

  const addTemplate = () => {
    if (!form.title || !form.category || !form.image) return;
    setItems((prev) => [{ id: `tpl_${Date.now()}`, ...form }, ...prev]);
    setForm({ title: "", category: "", image: "" });
  };

  return (
    <section className="py-4 md:py-6">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>Templates</motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Manage predefined templates. Add new ones below.
        </motion.p>

        {/* Form */}
        <motion.div variants={fadeUp} className="mb-6 rounded-2xl border bg-white p-4 shadow-soft-1">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Title"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1/40"
            />
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Category"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1/40"
            />
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="Reference image URL"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1/40"
            />
          </div>
          <div className="mt-3">
            <Button onClick={addTemplate} size="sm">Add template</Button>
          </div>
        </motion.div>

        {/* List */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t.id} className="overflow-hidden rounded-2xl border bg-white shadow-soft-1">
              <div className="relative aspect-video">
                <img src={t.image} alt={t.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-text-body/70">{t.category}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}