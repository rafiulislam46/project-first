"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { getClientSupabase } from "@/lib/supabase-browser";

type CatalogModel = {
  id: string;
  name: string;
  gender?: "male" | "female" | string | null;
  thumb_url?: string | null;
  styles?: { key: string; thumb_url?: string | null; thumb?: string | null }[] | null;
};

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: CatalogModel[] };

export default function ModelsList() {
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState({ status: "loading" });

      try {
        const client = getClientSupabase();
        if (!client) {
          if (!cancelled) {
            setState({
              status: "error",
              error:
                "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
            });
          }
          return;
        }

        const { data, error } = await client
          .from("catalog_models")
          .select("id, name, gender, thumb_url, styles")
          .order("id", { ascending: true });

        // Debug logging to help diagnose thumbnail issues
        // This will appear in the browser console
        console.log("[Supabase] catalog_models response:", { data, error });

        if (error) {
          if (!cancelled) setState({ status: "error", error: error.message });
          return;
        }

        if (!cancelled) {
          setState({ status: "success", data: data as CatalogModel[] });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setState({ status: "error", error: msg });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    if (state.status !== "success") return [];
    return state.data.map((m) => {
      // Prefer top-level thumb_url, otherwise styles[0].thumb or styles[0].thumb_url
      const styleThumb =
        (m.styles?.[0] as any)?.thumb_url || (m.styles?.[0] as any)?.thumb || null;
      const thumb = m.thumb_url || styleThumb || "/catalog/models/model_card.svg";
      return { ...m, thumb };
    });
  }, [state]);

  if (state.status === "loading" || state.status === "idle") {
    return <div className="text-text-body px-4 md:px-6">Loading models…</div>;
  }

  if (state.status === "error") {
    return (
      <div className="text-red-600 px-4 md:px-6">
        Failed to load models. {state.error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-6">
      {items.map((m) => {
        const id = String(m.id);
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
                  src={m.thumb as string}
                  alt={m.name || "Model"}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  onError={() => {
                    // If Next Image optimization fails, fallback to <img>
                    setFailedImages((prev) => ({ ...prev, [id]: true }));
                  }}
                />
              ) : (
                <img
                  src={m.thumb as string}
                  alt={m.name || "Model"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <div className="mt-2 text-sm text-text-hi truncate">{m.name || id}</div>
          </Link>
        );
      })}
    </div>
  );
}