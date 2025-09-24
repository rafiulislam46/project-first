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
        <motion.h2 className="mb-2" variants={fadeUp}>
          Sign in
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          {HAS_SUPABASE
            ? "Welcome back. Sign in with your email and password, or create a new account."
            : "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."}
        </motion.p>

        <motion.div className="glass-card p-6 space-y-6" variants={fadeUp}>
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