import type { Metadata } from "next";
import "./globals.css";
import { Inter, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MotionProvider from "@/components/motion-provider";
import PageTransition from "@/components/page-transition";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "AI Product Studio — Model Try‑On, Templates, Copy & Variations",
    template: "%s · AI Product Studio",
  },
  description:
    "Generate premium visuals in minutes. Model try‑ons, reference templates, auto copywriting, and 5 fast variations. Accessible, fast, and delightful.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://example.com/",
    title: "AI Product Studio — Model Try‑On, Templates, Copy & Variations",
    description:
      "Generate premium visuals in minutes. Model try‑ons, reference templates, auto copywriting, and 5 fast variations.",
    images: [{ url: "/demo/tryon/1.svg", width: 1200, height: 630, alt: "Demo preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Product Studio — Model Try‑On, Templates, Copy & Variations",
    description:
      "Generate premium visuals in minutes. Model try‑ons, reference templates, auto copywriting, and 5 fast variations.",
    images: ["/demo/tryon/1.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          plusJakarta.variable,
          sora.variable,
          "min-h-screen bg-base text-text-body antialiased"
        )}
      >
        <ThemeProvider>
          <MotionProvider>
            <div className="relative flex min-h-screen flex-col bg-lux-gradient">
              <Navbar />
              <main className="flex-1">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </div>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}