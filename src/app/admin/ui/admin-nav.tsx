"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";
import { LayoutDashboard, Users, Image as ImageIcon, FileText, CreditCard, Settings } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/images", label: "Images", icon: ImageIcon },
  { href: "/admin/templates", label: "Templates", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export default function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="rounded-2xl border bg-[#0B0B0E] text-white/90 shadow-soft-1">
      {/* Mobile header */}
      <div className="flex items-center justify-between lg:hidden px-4 py-3">
        <span className="text-sm font-semibold">Admin</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <ul className={cn("px-2 py-2 space-y-1", !open && "hidden lg:block")}>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href as Route}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/5",
                )}
              >
                <Icon size={16} className="shrink-0 text-white/70" />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}