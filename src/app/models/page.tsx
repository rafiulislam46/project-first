"use client";

import { motion, useAnimation } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  loadAssetManifest,
  loadLocalJSON,
  overrideModelsWithManifest,
  getSelectedModelId,
  setSelectedModelId,
  cn,
} from "@/lib/utils";
import { IS_MOCK, IS_FREE } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";

type ModelStyle = { key: string; thumb?: string };
type Model = { id: string; name: string; gender?: string; styles?: ModelStyle[] };

type Gender = "male" | "female" | "all";
type StyleKey = string | "all";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[] | null>(null);
  const [gender, setGender] = useState<Gender>("all");
  const [style, setStyle] = useState<StyleKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    setSelectedId(getSelectedModelId());
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (IS_MOCK) {
          const [local, manifest] = await Promise.all([
            loadLocalJSON<Model[]>("/data/models.json"),
            loadAssetManifest(),
          ]);
          let merged = overrideModelsWithManifest(local || [], manifest);
          // Restrict free users to a subset
          if (IS_FREE) {
            merged = merged.slice(0, 6);
          }
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

  // Compute unique style chips from loaded models
  const styleOptions = useMemo(() => {
    const set = new Set<string>();
    (models || []).forEach((m) => (m.styles || []).forEach((s) => set.add(s.key)));
    return ["all", ...Array.from(set).sort()];
  }, [models]);

  const filtered = useMemo(() => {
    if (!models) return null;
    return models.filter((m) => {
      const genderOk = gender === "all" || (m.gender || "").toLowerCase() === gender;
      const styleOk =
        style === "all" || (m.styles || []).some((s) => s.key.toLowerCase() === String(style).toLowerCase());
      return genderOk && styleOk;
    });
  }, [models, gender, style]);

  useEffect(() => {
    controls.start("show");
  }, [filtered, controls]);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Models
        </motion.h2>
        <motion.p className="mb-2 text-text-body" variants={fadeUp}>
          Choose a model to continue. Your selection will be used on upload.
        </motion.p>
        {IS_FREE && (
          <motion.p className="mb-8 text-xs text-text-body/70" variants={fadeUp}>
            Free plan shows a limited set of models. Upgrade to unlock the full catalog.
          </motion.p>
        )}

        {/* Filters */}
        <motion.div className="mb-6 flex flex-wrap items-center gap-3" variants={fadeUp}>
          <div className="flex items-center gap-2">
            {(["all", "female", "male"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs transition border",
                  gender === g
                    ? "border-accent-1/60 bg-accent-1/10 text-text-hi"
                    : "border-white/10 bg-white/5 text-text-body hover:bg-white/10"
                )}
              >
                {g[0].toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
          <div className="mx-2 h-5 w-px bg-white/10" />
          <div className="flex flex-wrap items-center gap-2">
            {styleOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs transition border",
                  style === s
                    ? "border-accent-1/60 bg-accent-1/10 text-text-hi"
                    : "border-white/10 bg-white/5 text-text-body hover:bg-white/10"
                )}
                title={s}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

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
          {!filtered && (
            <motion.div className="text-text-body" variants={fadeUp}>
              Loading...
            </motion.div>
          )}
          {filtered?.map((m, idx) => {
            const styleThumb = m.styles?.[0]?.thumb;
            const isAbsolute = styleThumb && /^https?:\/\//.test(styleThumb);
            const fallbackThumb = `/catalog/models/model_card.svg`;
            const thumb = isAbsolute ? styleThumb! : fallbackThumb;

            const selected = selectedId === m.id;

            return (
              <Card3DTilt
                key={m.id}
                index={idx}
                onClick={() => {
                  const next = selected ? null : m.id;
                  setSelectedId(next);
                  setSelectedModelId(next);
                }}
                selected={selected}
                variants={fadeUp}
                className={cn(
                  "glass-card p-0 overflow-hidden cursor-pointer transition",
                  IS_MOCK && IS_FREE ? "demo-watermark" : ""
                )}
              >
                <div className="relative aspect-[4/3] w-full bg-black/20">
                  <img src={thumb} alt={m.name} className="h-full w-full object-cover" />
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
                  <h3 className="mb-1">{m.name}</h3>
                  <p className="mb-3 text-xs text-text-body/70">{m.gender ? m.gender : "—"}</p>
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