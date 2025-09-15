"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";
import React from "react";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion={prefersReduced ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}