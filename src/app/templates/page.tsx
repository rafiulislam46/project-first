"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

type Template = { id: string; name: string; category?: string | null; refUrl?: string | null; thumb?: string | null };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/templates", { cache: "no-store" });
        const json = await res.json().catch(() => ({ items: [] as Template[] }));
        const items: Template[] = (json.items || []).map((t: Template) => ({
          ...t,
          thumb: t.thumb || "/catalog/templates/template_card.svg",
        }));
        if (!ignore) setTemplates(items);
      } catch (e) {
        console.error("Failed to load templates:", e);
        if (!ignore) setTemplates([]);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const list = useMemo(() => templates, [templates]);

  return (
    <section className="w-full">
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-6">
          {!list && <div className="text-text-body">Loading...</div>}
          {list?.map((t) => {
            const thumb = t.thumb || "/catalog/templates/template_card.svg";
            return (
              <Link
                key={t.id}
                href={`/generator?item=${encodeURIComponent(t.id)}` as Route}
                className="block"
              >
                <img
                  src={thumb as string}
                  alt="Template"
                  className="w-full h-48 object-cover rounded-xl shadow hover:scale-105 transition-transform duration-300"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}