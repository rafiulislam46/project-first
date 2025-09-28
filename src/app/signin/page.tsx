"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import { HAS_SUPABASE } from "@/lib/config";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        {/* Brand row */}
        <motion.div className="mb-6 flex items-center gap-2" variants={fadeUp}>
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">
            AIProductStudio
          </span>
        </motion.div>

        {/* Heading + subheading */}
        <motion.h2 className="mb-2" variants={fadeUp}>
          Log in to AI Product Studio
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          {HAS_SUPABASE
            ? "Welcome back! Your journey to stunning product visuals awaits."
            : "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."}
        </motion.p>

        {/* Card */}
        <motion.div className="glass-card p-6 md:p-8 space-y-6" variants={fadeUp}>
          {HAS_SUPABASE ? (
            <Suspense fallback={<p>Loading...</p>}>
              <SignInForm />
            </Suspense>
          ) : (
            <p className="text-text-body">
              Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth.
            </p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}