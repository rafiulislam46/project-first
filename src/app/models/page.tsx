"use client";

import React from "react";
import ModelsList from "@/components/ModelsList";

/**
 * Models page backed by Supabase via /api/models (fetched in ModelsList).
 */
export default function ModelsPage() {
  return (
    <section className="w-full">
      <ModelsList />
    </section>
  );
}