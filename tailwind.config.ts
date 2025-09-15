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
        base: "#0B0F14",
        surface: "#0F1620",
        card: "#131A24",
        accent: {
          1: "#3B82F6",
          2: "#F5C44F",
        },
        text: {
          hi: "#E8EEF6",
          body: "#B7C1CF",
        },
        border: "rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "lux-gradient": "linear-gradient(180deg, #0F1620 0%, #0B0F14 100%)",
      },
      boxShadow: {
        "soft-1": "0 10px 30px rgba(0,0,0,0.35)",
        "soft-2": "0 20px 60px rgba(0,0,0,0.45)",
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