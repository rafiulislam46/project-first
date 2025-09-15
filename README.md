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
- src/lib/utils.ts — cn, motion variants, manifest helpers
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

---

## Premium placeholders and Cloudinary manifest

Out of the box, the app ships with premium placeholders:

- public/catalog/models — model thumbnails
- public/catalog/templates — template thumbnails
- public/demo/tryon — demo result images (try-on styles)
- public/demo/template — demo result images (template mode)
- public/brand — small SVG badges (bkash, nagad, rocket, card)

Data definitions live in public/data/*.json.

### Runtime manifest override

If you host your assets on Cloudinary (or anywhere with absolute URLs), you can publish a JSON manifest and point the app to it without code changes.

- Env variable: ASSET_MANIFEST_URL (or NEXT_PUBLIC_ASSET_MANIFEST_URL)
- When present, the app fetches the JSON at runtime and overrides local placeholders.
- If the fetch fails, the app gracefully falls back to local JSON and built-in placeholders.

Schema example:
{
  "models":[{"id":"M01","name":"Young Male Studio","gender":"male","styles":[{"key":"studio_clean","thumb":"https://.../M01_studio.png"}]}],
  "templates":[{"id":"T01","name":"T-shirt Premium","category":"fashion","refUrl":"https://.../T01_ref.png","thumb":"https://.../T01_thumb.png"}],
  "demos":{
    "tryon":["https://.../demo_tryon_1.jpg","..."],
    "template":["https://.../demo_tmpl_1.jpg","..."]
  }
}

### How to use placeholders

- MODE=mock by default uses local JSON in public/data and renders built-in premium thumbnails if no manifest is provided.
- You can replace or add assets under public/catalog and public/demo as needed.

### Host on Cloudinary and publish a manifest

1) Upload your assets (models, templates, demo images) to Cloudinary and obtain absolute URLs.
2) Create a JSON file matching the schema above, e.g. at https://your-domain.com/asset-manifest.json.
3) Set ASSET_MANIFEST_URL to that JSON URL.

### Set ASSET_MANIFEST_URL on Vercel

- In the Vercel dashboard, go to your Project → Settings → Environment Variables
- Add key ASSET_MANIFEST_URL with your manifest URL (you can also add NEXT_PUBLIC_ASSET_MANIFEST_URL)
- Redeploy. In MODE=mock, the app will fetch and use these URLs at runtime.

### Watermark in mock + Free

When MODE=mock and PLAN=free (or NEXT_PUBLIC_PLAN=free), result and thumbnail cards render a subtle DEMO ribbon watermark to indicate non-production assets.

You can disable this by upgrading PLAN (set PLAN=pro) or switching to live mode.
