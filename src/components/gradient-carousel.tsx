"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Slide = {
  title: string;
  subtitle: string;
  href: Route;
  gradient: string; // tailwind classes for bg
};

const AUTO_INTERVAL = 4500;

const slides: Slide[] = [
  {
    title: "Outfit any one",
    subtitle: "Dress models virtually in seconds.",
    href: "/generator" as Route,
    gradient: "from-purple-500 to-blue-500",
  },
  {
    title: "Product ad",
    subtitle: "Generate high-quality mockups instantly.",
    href: "/generator" as Route,
    gradient: "from-green-500 to-teal-500",
  },
  {
    title: "Copy ad style",
    subtitle: "Match premium ad styles for your brand.",
    href: "/generator" as Route,
    gradient: "from-pink-500 to-red-500",
  },
];

export default function GradientCarouselCards({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!draggingRef.current) next();
    }, AUTO_INTERVAL);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [next]);

  const onDragEnd = useCallback((_e: any, info: { offset: { x: number } }) => {
    draggingRef.current = false;
    const threshold = 40; // px
    if (info.offset.x < -threshold) {
      setIndex((i) => (i + 1) % slides.length);
    } else if (info.offset.x > threshold) {
      setIndex((i) => (i - 1 + slides.length) % slides.length);
    }
  }, []);

  const active = useMemo(() => slides[index], [index]);

  return (
    <div className={cn("w-full flex flex-col items-center", className)}>
      <div className="w-full max-w-md md:max-w-lg px-2">
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className={cn(
                "rounded-xl shadow-xl bg-gradient-to-r text-white",
                active.gradient
              )}
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragEnd={onDragEnd}
                className="p-6 md:p-8 min-h-[16rem] md:min-h-[18rem] flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-sm">
                    {active.title}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base max-w-prose">
                    {active.subtitle}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={active.href}
                    className="inline-flex items-center justify-center rounded-lg bg-black/70 hover:bg-black/80 text-white font-medium px-4 py-2 transition"
                  >
                    Explore Now →
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2">
        {slides.map((_, i) => {
          const activeDot = i === index;
          return (
            <button
              key={`dot-${i}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                activeDot ? "w-5 bg-black/80" : "w-2.5 bg-black/30 hover:bg-black/50"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}