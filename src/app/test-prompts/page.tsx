"use client";

import React, { useState } from "react";

/**
 * Test Prompt page — pixel-accurate static UI to match the provided reference.
 * Top navbar remains unchanged (from layout). No extra functionality is added.
 */
export default function TestPromptsPage() {
  const [imagesCount, setImagesCount] = useState<number>(3);

  return (
    <section className="container mx-auto px-6 md:px-10 lg:px-16 py-10">
      {/* Two-column layout: left controls card, right template area */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-12">
        {/* Left: Generate Product Ads card */}
        <div className="rounded-2xl border bg-white shadow-sm p-5 md:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Generate Product Ads</h3>

          {/* Product Image upload */}
          <div className="mt-5">
            <div className="text-sm font-medium text-slate-900">Product Image</div>

            <div className="mt-3 rounded-xl border border-slate-200 border-dashed bg-white">
              <label
                htmlFor="product-image"
                className="flex flex-col items-center justify-center gap-2 px-6 py-10 cursor-pointer text-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-slate-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 16.5a3.5 3.5 0 0 0-3.5-3.5H7.5A3.5 3.5 0 0 0 4 16.5V17a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-slate-500">Drag &amp; drop your product image here,</p>
                <p className="text-sm text-slate-500">or</p>
                <button className="mt-1 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Browse Files
                </button>
              </label>
              <input id="product-image" type="file" className="sr-only" />
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="mt-6">
            <div className="text-sm font-medium text-slate-900">Custom Prompt</div>
            <textarea
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
              rows={3}
              placeholder="Describe your desired product ad (e.g., 'A sleek smartphone on a futuristic minimalist desk with soft studio lighting')"
            />
          </div>

          {/* Number of Images */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-900">Number of Images (1-5)</div>
              <div className="text-sm text-slate-700">{imagesCount}</div>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={imagesCount}
              onChange={(e) => setImagesCount(Number(e.target.value))}
              className="mt-3 w-full accent-indigo-600"
            />
          </div>

          {/* Generate button */}
          <button className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Generate Product Ads
          </button>
        </div>

        {/* Right: predefined templates and results header */}
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900">Predefined Templates</h3>

          {/* Three template boxes */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Template 1 */}
            <div className="flex flex-col items-center">
              <div className="h-28 w-full rounded-2xl border border-slate-200"></div>
              <div className="mt-3 text-sm text-slate-700">Minimalist Studio</div>
            </div>

            {/* Template 2 */}
            <div className="flex flex-col items-center">
              <div className="h-28 w-full rounded-2xl border border-slate-200"></div>
              <div className="mt-3 text-sm text-slate-700">Outdoor Lifestyle</div>
            </div>

            {/* Template 3 */}
            <div className="flex flex-col items-center">
              <div className="h-28 w-full rounded-2xl border border-slate-200"></div>
              <div className="mt-3 text-sm text-slate-700">Futuristi</div>
            </div>
          </div>

          {/* Results section title */}
          <div className="mt-12">
            <h3 className="text-center text-lg font-semibold text-slate-900">Your AI-Generated Product Ads</h3>
          </div>
        </div>
      </div>
    </section>
  );
}