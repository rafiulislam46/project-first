import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "AI Product Studio — Model Try-On, Templates, Copy & Variations",
  description:
    "Generate premium visuals in minutes. Model try-ons, reference templates, auto copywriting, and 5 fast variations. Accessible, fast, and delightful.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}