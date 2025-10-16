// Minimal ModelPicker component (client-safe)
// Provides a simple select and grid of model thumbnails. Integrate where needed.
"use client";

import React from "react";

export type ModelItem = {
  id: string;
  name?: string;
  gender?: string;
  thumb: string;
};

type Props = {
  items: ModelItem[];
  value?: string | null;
  onChange?: (id: string) => void;
};

export default function ModelPicker({ items, value, onChange }: Props) {
  const selected = value ?? (items[0] ? items[0].id : null);

  return (
    <div className="space-y-3">
      <select
        value={selected ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
      >
        {items.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name || m.id}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-3">
        {items.slice(0, 9).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange?.(m.id)}
            className={`overflow-hidden rounded-md border border-gray-200 bg-white ${
              selected === m.id ? "ring-2 ring-indigo-500" : ""
            }`}
            title={m.name || m.id}
          >
            <img
              src={m.thumb}
              alt={m.name || m.id}
              className="aspect-square w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
}