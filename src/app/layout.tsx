import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LeftSidebar from "@/components/layout/left-sidebar";
import BottomNav from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";
import MotionProvider from "@/components/motion-provider";
import PageTransition from "@/components/page-transition";

export const metadata: Metadata = {
  title: "AI Product Studio — Model Try-On, Templates, Copy & Variations",
  description:
    "Generate premium visuals in minutes. Model try-ons, reference templates, auto copywriting, and 5 fast variations. Accessible, fast, and delightful.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-lux-gradient min-h-screen">
        <ThemeProvider>
          <MotionProvider>
            {/* Top bar */}
            <Navbar />

            {/* App shell: left sidebar on desktop, content on right */}
            <div className="flex">
              <LeftSidebar />
              <div className="min-h-[calc(100vh-56px)] flex-1 pb-14 md:pb-0">
                <PageTransition>{children}</PageTransition>
              </div>
            </div>

            {/* Footer */}
            <Footer />

            {/* Mobile bottom navigation */}
            <BottomNav />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}