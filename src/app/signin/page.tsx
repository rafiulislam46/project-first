"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";
import { HAS_SUPABASE } from "@/lib/config";

export default function SignInPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Sign in
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          {HAS_SUPABASE
            ? "Authentication UI coming soon. Connect your Supabase project and customize this page."
            : "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."}
        </motion.p>

        <motion.div className="glass-card p-6" variants={fadeUp}>
          <p className="text-text-body">
            Don't have an account?{" "}
            <Link href={"/signup" as Route} className="text-accent-1 underline underline-offset-4">
              Sign up
          </  Link </Link>
            .
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}