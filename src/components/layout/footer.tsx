import React from "react";
import Link from "next/link";
import type { Route } from "next";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/80">
      <div className="container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-text-body/80">
          © {new Date().getFullYear()} AI Product Studio. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link href={"/terms" as Route} className="hover:text-text-hi rounded-md px-1">
            Terms
          </Link>
          <Link href={"/privacy" as Route} className="hover:text-text-hi rounded-md px-1">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}