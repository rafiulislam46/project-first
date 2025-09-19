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
import Sidebar, { type SidebarItem } from "@/components/layout/sidebar";
import SearchBar from "@/components/ui/search-bar";
import { useRouter } from "next/navigation";

type ModelStyle = { key: string; thumb?: string };
type Model = { id: string; name: string; gender?: string; styles?: ModelStyle[] };

type Gender = "male" | "female" | "all";
type StyleKey = string | "all";

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[] | null>(null);
  const [gender, setGender] = useState<Gender>("all");
  const [style, setStyle] = useState<StyleKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
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
            merged = merged.slice(0, 12);
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

  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      styleOptions.map((s) => ({
        key: s,
        label: s === "all" ? "All Styles" : s,
        count:
          s === "all"
            ? (models || []).length
            : (models || []).filter((m) => (m.styles || []).some((x) => x.key.toLowerCase() === String(s).toLowerCase()))
                .length,
      })),
    [styleOptions, models]
  );

  const filtered = useMemo(() => {
    if (!models) return null;
    return models.filter((m) => {
      const genderOk = gender === "all" || (m.gender || "").toLowerCase() === gender;
      const styleOk =
        style === "all" || (m.styles || []).some((s) => s.key.toLowerCase() === String(style).toLowerCase());
      const searchOk =
        !q.trim() ||
        m.name.toLowerCase().includes(q.trim().toLowerCase()) ||
        (m.gender || "").toLowerCase().includes(q.trim().toLowerCase());
      return genderOk && styleOk && searchOk;
    });
  }, [models, gender, style, q]);

  useEffect(() => {
    controls.start("show");
  }, [filtered, controls]);

  return (
    <section className="container py-8 md:py-12">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.div className="mb-6" variants={fadeUp}>
          <h2 className="mb-1">Mockups</h2>
          <p className="text-text-body">Choose a model to continue. Your selection will be used on upload.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar items={sidebarItems} value={String(style)} onChange={(k) => setStyle(k as StyleKey)} title="Styles" />

          <div className="flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SearchBar value={q} onChange={setQ} placeholder="Search models…" className="sm:max-w-xs" />
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "female", "male"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition",
                      gender === g
                        ? "bg-accent-1/10 text-text-hi ring-1 ring-accent-1/20"
                        : "text-text-body hover:bg-surface"
                    )}
                  >
                    {g[0].toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
              }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                      try {
                        router.back();
                      } catch {
                        router.push("/upload");
                      }
                    }}
                    selected={selected}
                    variants={fadeUp}
                    className={cn(
                      "glass-card p-0 overflow-hidden cursor-pointer transition bg-white",
                      IS_MOCK && IS_FREE ? "demo-watermark" : ""
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full bg-surface">
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
                    <div className="p-5">
                      <h3 className="mb-1">{m.name}</h3>
                      <p className="mb-3 text-xs text-text-body/70">{m.gender ? m.gender : "—"}</p>
                      {m.styles && m.styles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {m.styles.slice(0, 4).map((s) => (
                            <span
                              key={s.key}
                              className="rounded-md bg-surface px-2 py-1 text-xs text-text-body"
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
          </div>
        </div>
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
        selected ? "ring-2 ring-emerald-400/50" : "ring-1 ring-[rgba(15,23,42,0.08)]",
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
          : "0 8px 30px rgba(2,6,23,0.10)";
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
          selected ? "ring-2 ring-emerald-400/50" : "ring-1 ring-[rgba(15,23,42,0.08)]"
        )}
        style={{ mixBlendMode: "normal" }}
      />
    </motion.div>
  );
}