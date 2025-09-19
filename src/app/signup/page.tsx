"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/utils";
import Link from "next/link";
import { HAS_SUPABASE } from "@/lib/config";

export default function SignUpPage() {
  return (
    <section className="container py-12 md:py-16">
      <motion.div initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h2 className="mb-2" variants={fadeUp}>
          Sign up
        </motion.h2>
        <motion.p className="mb-8 text-text-body" variants={fadeUp}>
          {HAS_SUPABASE
            ? "Registration UI coming soon. Connect your Supabase project and customize this page."
            : "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."}
        </motion.p>

        <motion.div className="glass-card p-6" variants={fadeUp}>
          <p className="text-text-body">
            Already have an account?{" "}
            <Link href={{ pathname: "/signin" }} className="text-accent-1 underline underline-offset-4">
              Sign in
            </Link>
            .
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}