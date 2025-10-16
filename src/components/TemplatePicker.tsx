// Minimal TemplatePicker component
"use client";

import React from "react";

export type TemplateItem = {
  id: string;
  name: string;
  category?: string | null;
  thumb?: string | null;
};

type Props = {
  items: TemplateItem[];
  value?: string | null;
  onChange?: (id: string) => void;
};

export default function TemplatePicker({ items, value, onChange }: Props) {
  const selected = value ?? (items[0] ? items[0].id : null);

  return (
    <div className="space-y-3">
      <select
        value={selected ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
      >
        {items.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-3">
        {items.slice(0, 9).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange?.(t.id)}
            className={`overflow-hidden rounded-md border border-gray-200 bg-white ${
              selected === t.id ? "ring-2 ring-indigo-500" : ""
            }`}
            title={t.name}
          >
            <img
              src={t.thumb || "/catalog/templates/template_card.svg"}
              alt={t.name}
              className="aspect-square w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
}