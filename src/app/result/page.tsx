"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, loadAssetManifest, getDemoImages } from "@/lib/utils";
import { IS_MOCK, IS_FREE } from "@/lib/config";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const [tryon, setTryon] = useState<string[] | null>(null);
  const [tmpl, setTmpl] = useState<string[] | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (IS_MOCK) {
          const manifest = await loadAssetManifest();
          const mTryon = getDemoImages(manifest, "tryon");
          const mTmpl = getDemoImages(manifest, "template");
          const localTryon = mTryon.length ? mTryon : [1,2,3,4,5].map((i) => `/demo/tryon/${i}.svg`);
          const localTmpl = mTmpl.length ? mTmpl : [1,2,3,4,5].map((i) => `/demo/template/${i}.svg`);
          if (!ignore) {
            setTryon(localTryon);
            setTmpl(localTmpl);
          }
        } else {
          if (!ignore) {
            setTryon([]);
            setTmpl([]);
          }
        }
      } catch {
        if (!ignore) {
          setTryon([]);
          setTmpl([]);
        }
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Result
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          Demo results for style try-on and template mode.
        </motion.p>

        <motion.div className="grid gap-6 md:grid-cols-2" variants={staggerContainer}>
          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h3 className="mb-3">Try-on</h3>
            {!tryon && <div className="text-text-body">Loading...</div>}
            <div className="grid grid-cols-2 gap-3">
              {tryon?.map((src, i) => (
                <div key={src} className={"overflow-hidden rounded-2xl border " + (IS_MOCK && IS_FREE ? "demo-watermark" : "")}>
                  <img src={src} alt={`tryon_${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h3 className="mb-3">Template</h3>
            {!tmpl && <div className="text-text-body">Loading...</div>}
            <div className="grid grid-cols-2 gap-3">
              {tmpl?.map((src, i) => (
                <div key={src} className={"overflow-hidden rounded-2xl border " + (IS_MOCK && IS_FREE ? "demo-watermark" : "")}>
                  <img src={src} alt={`template_${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}