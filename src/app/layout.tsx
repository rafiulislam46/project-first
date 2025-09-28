import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BottomNav from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";
import MotionProvider from "@/components/motion-provider";
import PageTransition from "@/components/page-transition";
import AuthProvider from "@/lib/AuthProvider";

export const metadata: Metadata = {
  title: "AI Product Studio — Model Try-On, Templates, Copy & Variations",
  description:
    "Generate premium visuals in minutes. Model try-ons, reference templates, auto copywriting, and 5 fast variations. Accessible, fast, and delightful.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-lux-gradient min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <MotionProvider>
              {/* Top bar */}
              <Navbar />

              {/* Content only (no left sidebar) */}
              <div className="min-h-[calc(100vh-56px)]">
                <PageTransition>{children}</PageTransition>
              </div>

              {/* Footer */}
              <Footer />

              {/* Mobile bottom navigation */}
              <BottomNav />
            </MotionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}