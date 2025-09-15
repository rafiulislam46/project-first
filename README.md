# Lux Next App

A Next.js 14 (App Router, TypeScript) starter with Tailwind CSS, shadcn/ui-style components, Framer Motion, ESLint + Prettier.

Premium theme: dark, luxurious, minimal.

## Tech

- Next.js 14 (app router, TS)
- Tailwind CSS (+ tailwindcss-animate)
- shadcn/ui patterns (built-in Button using cva, radix Slot)
- Framer Motion with reduced-motion support
- ESLint + Prettier

## Getting Started

1) Install
- npm install
2) Run dev
- npm run dev
3) Lint
- npm run lint
4) Build
- npm run build

Open http://localhost:3000.

## Structure

- src/app/layout.tsx — global layout, fonts, providers
- src/app/page.tsx — hero + feature cards
- src/app/components/page.tsx — component samples (Button, inputs, card)
- src/components/layout/{navbar,footer}.tsx
- src/components/ui/button.tsx — shadcn-style Button
- src/components/theme-provider.tsx — dark theme wrapper
- src/components/motion-provider.tsx — MotionConfig with reduced-motion
- src/lib/utils.ts — cn, motion variants
- src/app/globals.css — theme tokens, utilities

## Design System

Colors
- base: #0B0F14
- surface: #0F1620
- card: #131A24
- text/hi: #E8EEF6
- text/body: #B7C1CF
- accent-1: #3B82F6
- accent-2: #F5C44F
- gradient: 180deg #0F1620 → #0B0F14 (bg-lux-gradient)

Typography
- Headings: Plus Jakarta Sans or Sora
- Body: Inter
- Scales: h1 56/62, h2 40/46, h3 28/34, body 16/26

Components
- Glass cards: glass-card
- Gradient buttons: btn-gradient and ui/Button
- Inputs: input-premium
- Container: max-w 1200px via container config

Accessibility
- WCAG AA contrast, :focus-visible rings
- Reduced motion respected globally via MotionProvider

## Notes

- This starter locks to dark mode but keeps a ThemeProvider for expansion.
- Tailwind content scanning is limited to src/**.
- To add more shadcn/ui components, follow the same Button pattern (cva + radix Slot) or install the shadcn CLI and generate components into src/components/ui.
