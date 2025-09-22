"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SiteConfig = {
  name: string;
  logo: string;
  primary: string;
  secondary: string;
};

export default function SettingsPage() {
  const [cfg, setCfg] = useState<SiteConfig>({
    name: "AI Product Studio",
    logo: "/logo.svg",
    primary: "#6b5cff",
    secondary: "#0ea5e9",
  });

  const onSave = () => {
    // stub
    alert("Settings saved (stub).");
  };

  return (
    <section className="py-4 md:py-6">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>Settings</motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Update site configuration. Save is stubbed for now.
        </motion.p>

        <motion.div variants={fadeUp} className="rounded-2xl border bg-white p-5 shadow-soft-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-text-body/70">Site name</label>
              <input
                value={cfg.name}
                onChange={(e) => setCfg((s) => ({ ...s, name: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-body/70">Logo URL</label>
              <input
                value={cfg.logo}
                onChange={(e) => setCfg((s) => ({ ...s, logo: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-1/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-body/70">Primary color</label>
              <input
                type="color"
                value={cfg.primary}
                onChange={(e) => setCfg((s) => ({ ...s, primary: e.target.value }))}
                className="h-10 w-24 rounded-md border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-body/70">Secondary color</label>
              <input
                type="color"
                value={cfg.secondary}
                onChange={(e) => setCfg((s) => ({ ...s, secondary: e.target.value }))}
                className="h-10 w-24 rounded-md border"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={onSave}>Save settings</Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}