// Minimal dark/light ModeToggle using documentElement.class
"use client";

import React from "react";

export default function ModeToggle() {
  const [dark, setDark] = React.useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
      aria-pressed={dark}
      title="Toggle dark mode"
    >
      <span className="inline-block h-4 w-4 rounded-full bg-gray-900" />
      <span>{dark ? "Dark" : "Light"} Mode</span>
    </button>
  );
}