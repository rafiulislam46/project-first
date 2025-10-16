"use client";

import React from "react";
import ModelsList from "@/components/ModelsList";

/**
 * Models page backed by Supabase via /api/models (fetched in ModelsList).
 * Replicated to match the provided reference design while keeping the navbar intact.
 */
export default function ModelsPage() {
  return (
    <section className="w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-8">
        <h1 className="text-center">Select Your AI Model</h1>
        <p className="mt-4 text-center text-text-body">
          Browse our curated collection of futuristic and stylish&nbsp; models for your virtual
          try-on experience.
        </p>

        {/* Filter chips (UI only, no logic change) */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white bg-violet-500 shadow-sm"
            aria-pressed="true"
          >
            All
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-text-hi bg-white border"
          >
            Male
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-text-hi bg-white border"
          >
            Female
          </button>
        </div>
      </div>

      {/* Models grid */}
      <div className="max-w-6xl mx-auto pb-16">
        <ModelsList />
      </div>
    </section>
  );
}