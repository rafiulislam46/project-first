import React from "react";
import Link from "next/link";
import type { Route } from "next";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Small links row */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-8 text-sm text-gray-600">
          <Link href={"/#" as Route} className="hover:text-gray-900">Company</Link>
          <Link href={"/#" as Route} className="hover:text-gray-900">Support</Link>
          <Link href={"/#" as Route} className="hover:text-gray-900">Legal</Link>
        </div>
      </div>

      {/* Social row */}
      <div className="max-w-screen-xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-end gap-4 text-gray-700">
          {/* Simple social icons */}
          <a href="#" aria-label="Facebook" className="hover:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 8h-2c-.6 0-1 .4-1 1v2h3l-.5 3h-2.5v8H9v-8H7V11h2V9.8C9 8.3 10.2 7 11.7 7H15v1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 5.9c-.8.3-1.6.5-2.4.6.9-.6 1.6-1.4 1.9-2.4-.9.6-1.9 1-3 1.2A4.2 4.2 0 0 0 12 8.5c0 .3 0 .5.1.8-3.5-.2-6.6-1.9-8.6-4.5-.4.6-.6 1.4-.6 2.2 0 1.4.7 2.6 1.8 3.3-.7 0-1.3-.2-1.8-.5v.1c0 2 1.5 3.6 3.4 4-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1.6 1.7 2.2 2.9 4.1 2.9A8.5 8.5 0 0 1 2 19.5c1.4.9 3.1 1.5 4.9 1.5 5.9 0 9.1-4.9 9.1-9.1v-.4c.6-.4 1.2-1 1.6-1.6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="17" cy="7" r="1" fill="currentColor"/>
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 10v7M8 7.5v.5M11.5 17v-4a2 2 0 1 1 4 0v4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Watermark */}
      <div className="border-t border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 py-6 flex items-center">
          <div className="flex items-center gap-2 text-gray-900">
            <span className="text-sm">Made with</span>
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-600 text-white text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill="white" />
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Visily
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}