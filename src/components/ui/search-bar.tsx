"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function SearchBar({
  placeholder = "Search…",
  value,
  onChange,
  className,
  autoFocus = false,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  autoFocus?: boolean;
}) {
  const [internal, setInternal] = useState(value);

  useEffect(() => setInternal(value), [value]);

  return (
    <div className={cn("relative", className)}>
      <input
        className="w-full rounded-2xl border bg-white pl-10 pr-3 py-2 text-sm text-text-hi placeholder:text-text-body/50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/20"
        placeholder={placeholder}
        value={internal}
        onChange={(e) => {
          setInternal(e.target.value);
          onChange(e.target.value);
        }}
        autoFocus={autoFocus}
      />
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-body/60"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}