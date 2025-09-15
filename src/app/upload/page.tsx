"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, getSelectedModelId, getSelectedTemplateId } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelIdState] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateIdState] = useState<string | null>(null);

  useEffect(() => {
    setSelectedModelIdState(getSelectedModelId());
    setSelectedTemplateIdState(getSelectedTemplateId());
  }, []);

  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Upload
        </motion.h2>
        <motion.p className="mb-4 text-text-body" variants={fadeUp}>
          Upload a file to process. Your selected model and template will be used if set.
        </motion.p>

        <motion.div variants={fadeUp} className="glass-card p-6">
          <div className="mb-2">
            <span className="text-sm text-text-body">Selected model:</span>{" "}
            <span className="text-sm font-medium">{selectedModelId ?? "None"}</span>
          </div>
          <div className="mb-4">
            <span className="text-sm text-text-body">Selected template:</span>{" "}
            <span className="text-sm font-medium">{selectedTemplateId ?? "None"}</span>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm text-text-body">Choose file</span>
            <input
              type="file"
              className="input-premium w-full"
              onChange={(e) => {
                const f = e.target.files?.[0]?.name ?? null;
                setFileName(f);
              }}
            />
          </label>
          {fileName && <p className="mt-4 text-sm text-text-body">Selected: {fileName}</p>}
          <button className="btn-gradient mt-6">Process</button>
        </motion.div>
      </motion.div>
    </section>
  );
}