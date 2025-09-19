"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/select", label: "Search", icon: SearchIcon },
  { href: "/pricing", label: "Upgrade", icon: StarIcon },
  { href: "/dashboard", label: "Profile", icon: UserIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-white/95 backdrop-blur-md shadow-soft-1 md:hidden">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={{ pathname: it.href }}
              className={cn(
                "flex flex-col items-center justify-center py-2 text-xs",
                active ? "text-text-hi" : "text-text-body"
              )}
            >
              <Icon className="mb-0.5" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className = "" }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5l9-7 9 7V20a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon({ className = "" }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon({ className = "" }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none">
      <path d="M12 3l2.9 5.9L21 10l-4.5 4.4L17.8 21 12 18.3 6.2 21l1.3-6.6L3 10l6.1-1.1L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon({ className = "" }) {
  return (
    <svg className={cn("h-5 w-5", className)} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}