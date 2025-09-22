import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LeftSidebar from "@/components/layout/left-sidebar";
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

              {/* App shell: left fixed sidebar (desktop), right scrollable content */}
              <div className="flex h-[calc(100vh-56px)] overflow-hidden">
                <LeftSidebar />
                <div className="flex-1 overflow-y-auto pb-14 md:pb-0">
                  <PageTransition>{children}</PageTransition>
                </div>
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