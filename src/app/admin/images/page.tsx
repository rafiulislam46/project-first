"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";

type ImgRow = {
  id: string;
  userId: string;
  url: string;
  created_at: string;
};

const mockImages: ImgRow[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `img_${2000 + i}`,
  userId: `user_${1000 + (i % 6)}`,
  url: `https://res.cloudinary.com/demo/image/upload/c_fill,w_600,h_750,q_auto,f_auto/sample.jpg`,
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
}));

export default function ImagesPage() {
  return (
    <section className="py-4 md:py-6">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>Images</motion.h2>
        <motion.p className="mb-6 text-text-body" variants={fadeUp}>
          Recently generated images.
        </motion.p>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" variants={fadeUp}>
          {mockImages.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-2xl border bg-white shadow-soft-1">
              <div className="relative aspect-[4/5]">
                <img src={img.url} alt={img.id} className="h-full w-full object-cover" />
              </div>
              <div className="p-3 text-xs text-text-body/80">
                <div className="flex justify-between">
                  <span>User: {img.userId}</span>
                  <span>{new Date(img.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}