"use client";

import { motion, useAnimation } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  loadAssetManifest,
  loadLocalJSON,
  overrideTemplatesWithManifest,
  getSelectedTemplateId,
  setSelectedTemplateId,
  cn,
} from "@/lib/utils";
import { IS_MOCK, IS_FREE } from "@/lib/config";
import { useEffect, useState } from "react";

type Template = { id: string; name: string; category?: string; refUrl?: string; thumb?: string };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    setSelectedId(getSelectedTemplateId());
  }, []);

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

  useEffect(() => {
    controls.start("show");
  }, [templates, controls]);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Templates
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Start from curated templates and customize to your needs.
        </motion.p>

        {/* Grid */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {!templates && (
            <motion.div className="text-text-body" variants={fadeUp}>
              Loading...
            </motion.div>
          )}
          {templates?.map((t, idx) => {
            const thumb = t.thumb || "/catalog/templates/template_card.svg";
            const selected = selectedId === t.id;

            return (
              <Card3DTilt
                key={t.id}
                index={idx}
                onClick={() => {
                  const next = selected ? null : t.id;
                  setSelectedId(next);
                  setSelectedTemplateId(next);
                }}
                selected={selected}
                variants={fadeUp}
                className={cn(
                  "glass-card p-0 overflow-hidden cursor-pointer transition",
                  IS_MOCK && IS_FREE ? "demo-watermark" : ""
                )}
              >
                <div className="relative aspect-[4/3] w-full bg-black/20">
                  <img src={thumb} alt={t.name} className="h-full w-full object-cover" />
                  {selected && (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-medium text-white shadow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Selected
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="mb-1">{t.name}</h3>
                  <p className="mb-3 text-xs text-text-body/70">{t.category ? t.category : "—"}</p>
                  <div className="flex items-center gap-3">
                    <a
                      href={t.refUrl || "#"}
                      target="_blank"
                      className="text-accent-1/80 hover:text-accent-1 underline underline-offset-2 text-sm"
                    >
                      Reference
                    </a>
                    <span className="ml-auto text-[11px] text-text-body">{selected ? "Selected" : "Click to use"}</span>
                  </div>
                </div>
              </Card3DTilt>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* 3D tilt + hover scale + glow */
function Card3DTilt({
  children,
  className,
  selected,
  onClick,
  variants,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  variants?: any;
  index?: number;
}) {
  return (
    <motion.div
      variants={variants}
      onClick={onClick}
      className={cn(
        className,
        "relative will-change-transform",
        "transition-transform duration-200 hover:scale-[1.02]",
        selected ? "ring-2 ring-emerald-400/70" : "ring-1 ring-white/10",
      )}
      style={{
        transformStyle: "preserve-3d",
      }}
      whileHover={{}}
      onMouseMove={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (py - 0.5) * -8; // tilt up/down
        const ry = (px - 0.5) * 8; // tilt left/right
        target.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
        target.style.boxShadow = selected
          ? "0 8px 30px rgba(16, 185, 129, 0.25)"
          : "0 8px 30px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLDivElement;
        target.style.transform = "";
        target.style.boxShadow = "";
      }}
    >
      {children}
      {/* soft glow border */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          selected ? "ring-2 ring-emerald-400/60" : "ring-1 ring-white/10"
        )}
        style={{ mixBlendMode: "screen" }}
      />
    </motion.div>
  );
}