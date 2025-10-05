"use client";

import React from "react";
import Link from "next/link";
import type { Route } from "next";

export default function AiToolPage() {
  return (
    <main className="bg-white">
      {/* Hero card */}
      <section className="max-w-screen-xl mx-auto px-4 pt-10 pb-16">
        <div className="rounded-3xl bg-[#F5F6FA] border border-gray-200 px-6 sm:px-12 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-[28px] sm:text-[36px] md:text-[44px] leading-tight font-extrabold text-gray-900">
              Unleash the Future of Product Visuals
              <br className="hidden sm:block" /> with AI
            </h1>
            <p className="mt-4 text-gray-600">
              Leverage advanced AI to transform your product imaging workflow, from virtual try-ons to stunning ad
              creatives.
            </p>
            <div className="mt-8">
              <Link
                href={"/generator" as Route}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
              >
                <span>Start Generating</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core capabilities */}
      <section className="max-w-screen-xl mx-auto px-4 pb-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Our Core AI Capabilities</h2>
          <p className="mt-3 text-gray-600">
            Explore the powerful tools designed to elevate your product presentation and
            marketing efforts.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "AI Product Imaging",
              desc:
                "Generate high-resolution, pixel-perfect images of your products in diverse settings and styles. Perfect for e‑commerce and marketing.",
              iconBg: "bg-indigo-50",
            },
            {
              title: "Virtual Try-On",
              desc:
                "Place your products on AI-generated models, allowing customers to visualize items realistically before purchase, enhancing conversion.",
              iconBg: "bg-indigo-50",
            },
            {
              title: "AI Ad Generation",
              desc:
                "Instantly create compelling ad creatives and campaign visuals optimized for various platforms and target audiences with minimal effort.",
              iconBg: "bg-indigo-50",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className={`h-10 w-10 ${card.iconBg} rounded-full flex items-center justify-center text-indigo-600`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="mt-4 font-semibold text-gray-900">{card.title}</div>
              <div className="mt-2 text-sm text-gray-600">{card.desc}</div>
              <div className="mt-4">
                <a href="#" className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium">
                  Learn More
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spacer to reflect design whitespace */}
      <div className="py-24" />

      {/* Process section */}
      <section className="max-w-screen-xl mx-auto px-4 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            How Our AI Transforms Your Vision
          </h2>
          <p className="mt-3 text-gray-600">
            Our intuitive process makes high-quality visual content creation accessible to everyone.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "1",
                title: "Upload Your Product",
                desc:
                  "Easily upload product images from your device. Our AI handles various formats.",
              },
              {
                n: "2",
                title: "Select AI Enhancements",
                desc:
                  "Choose from virtual models, templates, and style presets to apply AI magic.",
              },
              {
                n: "3",
                title: "Generate & Download",
                desc:
                  "Witness instant, high-quality visuals. Download your creations in various formats.",
              },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold">
                  {step.n}
                </div>
                <div className="mt-4 font-semibold text-gray-900">{step.title}</div>
                <div className="mt-2 text-sm text-gray-600">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-screen-xl mx-auto px-4 pb-20">
        <div className="rounded-3xl overflow-hidden border border-gray-200">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(253,186,116,0.18),transparent_40%)]" />
            <div className="relative bg-[#F5F6FA] px-6 sm:px-12 py-16">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Ready to Elevate Your Visuals?</h3>
                <p className="mt-2 text-gray-600">
                  Join the AI Product Studio community and start creating breathtaking product content today.
                </p>
                <div className="mt-8">
                  <Link
                    href={"/signup" as Route}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-500"
                  >
                    <span>Sign Up for Free</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}