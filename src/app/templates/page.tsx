"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { getClientSupabase } from "@/lib/supabase-browser";

type Template = { id: string; name: string; category: string; thumb_url: string };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const client = getClientSupabase();
        if (!client) {
          console.error("Error fetching templates: Supabase not configured");
          if (!ignore) setTemplates([]);
          return;
        }
        const { data, error } = await client
          .from("catalog_templates")
          .select("id, name, category, thumb_url")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching templates", error);
          if (!ignore) setTemplates([]);
          return;
        }

        const items: Template[] =
          (data || []).map((t: any) => ({
            id: String(t.id),
            name: String(t.name || ""),
            category: String(t.category || ""),
            thumb_url: t.thumb_url || "/catalog/templates/template_card.svg",
          })) || [];

        if (!ignore) setTemplates(items);
      } catch (e) {
        console.error("Error fetching templates", e);
        if (!ignore) setTemplates([]);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const list = useMemo(() => templates || [], [templates]);

  return (
    <section className="w-full">
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-6">
          {list.length === 0 && <div className="text-text-body">No templates found.</div>}
          {list.map((t: Template) => {
            const id = String(t.id);
            const thumb = t.thumb_url || "/catalog/templates/template_card.svg";
            const hasFailed = !!failedImages[id];
            return (
              <Link
                key={id}
                href={`/generator?item=${encodeURIComponent(id)}` as Route}
                className="block"
              >
                <div className="w-full h-48 relative rounded-xl overflow-hidden shadow">
                  {!hasFailed ? (
                    <Image
                      src={thumb as string}
                      alt={t.name || "Template"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [id]: true }));
                      }}
                    />
                  ) : (
                    <img
                      src={thumb as string}
                      alt={t.name || "Template"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}