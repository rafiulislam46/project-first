"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";

export default function Page() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="bg-rose-50">
        <div className="max-w-screen-xl mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-indigo-500">
              AI Product Studio
            </h1>
            <p className="mt-4 text-gray-700">
              Unleash the power of AI to create stunning virtual try-ons and captivating product ads, effortlessly.
            </p>
            <div className="mt-6">
              <Link
                href={"/generator" as Route}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
              >
                Start Creating Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discover collection */}
      <section className="bg-indigo-50">
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Discover Our Curated Collection</h2>
            <p className="mt-3 text-gray-600">
              Explore hand-picked models and design templates that elevate your product presentations.
            </p>
          </div>

          {/* Featured Models */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Featured Models</h3>
              <Link href={"/models" as Route} className="text-sm text-gray-800 hover:text-gray-900">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: "Elegance Collection Model",
                  desc: "Showcasing high-fashion apparel with a refined, sophisticated aesthetic.",
                },
                {
                  title: "Urban Style Pro Model",
                  desc: "Perfect for streetwear and modern, edgy product displays.",
                },
                {
                  title: "Active Lifestyle Model",
                  desc: "Ideal for sporting goods and health‑related product visualizations.",
                },
                {
                  title: "Executive Presence Model",
                  desc: "Conveying professionalism for corporate and high‑end product lines.",
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border bg-white shadow-sm p-6">
                  <div className="h-28 rounded-xl bg-gray-50 mb-4"></div>
                  <div className="font-semibold text-gray-900">{card.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Templates */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Featured Templates</h3>
              <Link href={"/templates" as Route} className="text-sm text-gray-800 hover:text-gray-900">
                See All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: "Minimalist E‑commerce Template",
                  desc: "Clean design focused on product imagery and user experience.",
                },
                {
                  title: "Dynamic Product Showcase",
                  desc: "Engage customers with animated elements and rich media integration.",
                },
                {
                  title: "High Fashion Retail Template",
                  desc: "Visually stunning layouts tailored for exclusive fashion collections.",
                },
                {
                  title: "Tech Gadget Promo Template",
                  desc: "Highlight innovative features with sleek and futuristic design elements.",
                },
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border bg-white shadow-sm p-6">
                  <div className="h-28 rounded-xl bg-gray-50 mb-4"></div>
                  <div className="font-semibold text-gray-900">{card.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transform section */}
      <section className="bg-white">
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Transform Your Vision into Reality</h2>
            <p className="mt-3 text-gray-600">
              AI Product Studio is your all‑in‑one platform for next‑gen product visualization.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Virtual Try‑On",
                desc: "See your products on diverse models in realistic scenarios, eliminating the need for expensive photoshoots.",
                href: "/tryon",
              },
              {
                title: "AI Ad Generation",
                desc: "Generate captivating product advertisements tailored to your brand with intelligent templates and designs.",
                href: "/test-prompts",
              },
              {
                title: "Powerful AI Tools",
                desc: "Leverage cutting‑edge AI for image enhancement, background removal, and seamless product integration.",
                href: "/generator",
              },
            ].map((f) => (
              <Link key={f.title} href={f.href as Route} className="rounded-2xl border bg-white shadow-sm p-6">
                <div className="text-indigo-600 mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900">{f.title}</div>
                <div className="text-sm text-gray-600 mt-1">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore features */}
      <section className="bg-indigo-50">
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Our Advanced Features</h2>
            <p className="mt-3 text-gray-600">
              Dive deeper into the capabilities that will redefine your product presentation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "AI Tool Suite", desc: "Discover advanced AI functionalities for product imaging and customization.", href: "/generator" },
              { title: "Flexible Pricing", desc: "Find the perfect plan that scales with your business needs and ambitions.", href: "/pricing" },
              { title: "Generate Product Ads", desc: "Create stunning, high‑quality advertisements for your products using AI.", href: "/test-prompts" },
            ].map((f) => (
              <Link key={f.title} href={f.href as Route} className="rounded-2xl border bg-white shadow-sm p-6">
                <div className="text-indigo-600 mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900">{f.title}</div>
                <div className="text-sm text-gray-600 mt-1">{f.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Ready to Get Started?</h3>
          <p className="mt-2 text-gray-600">
            Join thousands of businesses elevating their product imagery with AI.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href={"/signup" as Route} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500">
              Sign Up Now
            </Link>
            <Link href={"/signin" as Route} className="px-5 py-2.5 rounded-xl border bg-white text-gray-900 font-semibold hover:bg-slate-50">
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}