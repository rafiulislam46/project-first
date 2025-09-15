"use client";

import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-4xl font-bold text-center"
      >
        AI Product Studio
      </motion.h1>
      <p className="mt-4 text-lg text-center text-gray-600 max-w-xl">
        Upload your product, choose a model, and generate 5 premium styled variations instantly.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 px-6 py-3 rounded-xl bg-black text-white flex items-center gap-2"
      >
        Get Started <ArrowRight size={18} />
      </motion.button>
    </main>
  );
}