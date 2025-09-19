"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { IS_FREE } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Star } from "lucide-react";
import { saveFavorite } from "@/lib/store";

type CopyBlock = { title: string; description: string; hashtags: string[] };

export default function ResultPage() {
  const [tryon, setTryon] = useState<string[] | null>(null);
  const [tmpl, setTmpl] = useState<string[] | null>(null);
  const [copy, setCopy] = useState<CopyBlock | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const images = useMemo(() => {
    // Prefer tryon; if empty, use template
    return (tryon && tryon.length ? tryon : tmpl) || [];
  }, [tryon, tmpl]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [t1, t2, cpy] = await Promise.all([
          fetch("/api/tryon", { method: "POST", body: JSON.stringify({}) }).then((r) => r.json()).catch(() => ({ images: [] })),
          fetch("/api/template", { method: "POST", body: JSON.stringify({}) }).then((r) => r.json()).catch(() => ({ images: [] })),
          fetch("/api/copy", {
            method: "POST",
            body: JSON.stringify({ productName: "Premium Tote", context: "Minimal studio, soft daylight, lifestyle" }),
          })
            .then((r) => r.json())
            .catch(() => null),
        ]);
        if (!ignore) {
          setTryon(padToFive((t1?.images as string[]) || []));
          setTmpl(padToFive((t2?.images as string[]) || []));
          setCopy(cpy);
        }
      } catch {
        if (!ignore) {
          setTryon([]);
          setTmpl([]);
          setCopy(null);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleDownloadAll = async () => {
    for (const src of images) {
      triggerDownload(src);
      await wait(120);
    }
  };

  const handleSaveFavorite = async (src: string, kind: "tryon" | "template") => {
    setSaving(src);
    try {
      saveFavorite(kind, src);
    } finally {
      setSaving(null);
    }
  };

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Result
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          4–6 premium variations plus polished copywriting. Use quick actions to download or save favorites.
        </motion.p>

        {/* Quick actions */}
        <motion.div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3" variants={fadeUp}>
          <Button onClick={handleDownloadAll} className="gap-2 w-full sm:w-auto">
            <Download size={16} />
            Download All
          </Button>
          <span className="text-xs text-text-body/80">Tip: Click the star on any card to save it.</span>
        </motion.div>

        {/* Premium grid */}
        <motion.div className="grid gap-6 lg:grid-cols-[2fr,1fr]" variants={staggerContainer}>
          <motion.div className="glass-card p-6" variants={fadeUp}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="">Variations</h3>
            </div>

            {!tryon && !tmpl && <div className="text-text-body">Loading...</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {images.map((src, i) => {
                const kind: "tryon" | "template" = tryon && tryon.includes(src) ? "tryon" : "template";
                return (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl border bg-white/5 will-change-transform"
                    style={{ transformStyle: "preserve-3d" }}
                    onMouseMove={(e) => tilt(e)}
                    onMouseLeave={(e) => resetTilt(e)}
                  >
                    <div
                      className={
                        "relative aspect-[4/5] w-full overflow-hidden " + (IS_FREE ? "demo-watermark" : "")
                      }
                    >
                      <img
                        src={src}
                        alt={`variation_${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{ transform: "translateZ(0.001px)" }}
                      />
                    </div>

                    {/* Hover toolbar */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="pointer-events-auto flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 backdrop-blur">
                        <a href={src} download className="text-xs text-white/90 hover:text-white inline-flex items-center gap-1">
                          <Download size={14} /> Download
                        </a>
                        <button
                          onClick={() => handleSaveFavorite(src, kind)}
                          className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white"
                        >
                          <Star size={14} className="fill-yellow-400/70 text-yellow-400/90" />
                          {saving === src ? "Saving..." : "Save Favorite"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Copywriting block */}
          <motion.div className="glass-card p-6 h-fit" variants={fadeUp}>
            <h3 className="mb-3">Copywriting</h3>
            {!copy ? (
              <div className="text-text-body">Generating...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-body/70 mb-1">Title</p>
                  <p className="text-base font-medium text-text-hi">{copy.title}</p>
                </div>
                <div>
                  <p className="text-xs text-text-body/70 mb-1">Description</p>
                  <p className="text-sm text-text-body">{copy.description}</p>
                </div>
                <div>
                  <p className="text-xs text-text-body/70 mb-1">Hashtags</p>
                  <div className="flex flex-wrap gap-2">
                    {copy.hashtags.map((h) => (
                      <span key={h} className="rounded-full border px-2 py-1 text-xs text-text-body/90">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* utils */
function padToFive(arr: string[]) {
  const base = [...arr];
  const fallback = [1, 2, 3, 4, 5, 6].map((i) => `/demo/template/${i}.svg`);
  while (base.length < 6) base.push(fallback[base.length] || fallback[0]);
  return base.slice(0, 6);
}
function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = url.split("/").pop() || "image";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/* simple tilt effect */
function tilt(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget as HTMLDivElement;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const rx = (py - 0.5) * 6; // rotateX
  const ry = (0.5 - px) * 6; // rotateY
  el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
}
function resetTilt(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget as HTMLDivElement;
  el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
}