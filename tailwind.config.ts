import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Light theme base
        base: "#ffffff",
        surface: "#f8fafc", // slate-50-ish
        card: "#ffffff",
        accent: {
          1: "#2563EB", // blue-600
          2: "#F59E0B", // amber-500
        },
        text: {
          hi: "#0f172a", // slate-900
          body: "#334155", // slate-700
        },
        border: "rgba(15, 23, 42, 0.08)", // subtle slate border
      },
      backgroundImage: {
        "lux-gradient": "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      },
      boxShadow: {
        "soft-1": "0 8px 24px rgba(2, 6, 23, 0.08)",
        "soft-2": "0 16px 48px rgba(2, 6, 23, 0.12)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      fontSize: {
        h1: ["56px", { lineHeight: "62px", letterSpacing: "-0.02em" }],
        h2: ["40px", { lineHeight: "46px", letterSpacing: "-0.01em" }],
        h3: ["28px", { lineHeight: "34px", letterSpacing: "-0.005em" }],
        body: ["16px", { lineHeight: "26px" }],
      },
      backdropBlur: {
        md: "12px",
      },
    },
  },
  plugins: [animate],
};
export default config;