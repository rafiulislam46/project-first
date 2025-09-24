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

## Replicate Virtual Try-On (idm-vton)

This project includes a Virtual Try-On page and API using Replicate's idm-vton model.

### 1) Environment

Set REPLICATE_API_TOKEN in your environment.

- On Vercel:
  - Project → Settings → Environment Variables
  - Add key: REPLICATE_API_TOKEN
  - Value: your Replicate API token
  - Redeploy

- Locally (optional):
  - Create .env.local in the project root
  - Add:
    REPLICATE_API_TOKEN=your_token_here
  - Restart dev server

Note: The token is only used on the server in the Next.js API route and is never exposed to the client.

### 2) API Route

- Path: src/app/api/tryon/route.ts
- POST /api/tryon expects JSON:
  { "human_img": "https://...", "garm_img": "https://..." }
- It calls Replicate with version:
  0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985
  and input:
  { human_img, garm_img, garment_des: "test cloth", category: "upper_body" }
- Returns the full Replicate response as JSON.
- Also supports GET /api/tryon?id=<prediction_id> to poll a prediction on the server without exposing the token.

### 3) Frontend Page

- Path: src/app/tryon/page.tsx
- Client page with two inputs (Human Image URL, Cloth Image URL) and a Generate button.
- Calls POST /api/tryon and then polls GET /api/tryon?id=... until the prediction completes.
- Displays the resulting image on success and shows an error on failure.

Usage:
- Visit /tryon
- Paste your human and garment image URLs
- Click Generate

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

---

## Supabase Auth + Postgres (optional)

If NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are present, the app will:

- Use Supabase Auth for user sessions (cookies via @supabase/ssr).
- Store user profiles and saved assets in Postgres.
- Provide server adapters for plan/credits and saving assets.
- Fall back to local mock storage when env vars are missing.

### 1) Configure environment

Set these environment variables (locally in .env.local or in Vercel):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Optional:

- PLAN (or NEXT_PUBLIC_PLAN) default plan for mock mode
- MODE (or NEXT_PUBLIC_MODE) default is mock

### 2) Run migrations

Use the Supabase SQL editor or psql against your Supabase database and run:

- sql/000_init.sql
- (optional) sql/001_images.sql if you plan to store generated images too

This will create:

- profiles (id uuid PK->auth.users.id, display_name, plan text default 'free', credits int default 5, created_at timestamp default now())
- assets   (id uuid PK default gen_random_uuid(), user_id uuid, kind text, src_urls jsonb, copy jsonb, created_at timestamp default now())
- catalog_models (id text PK, name text, gender text, thumb_url text, styles jsonb)
- catalog_templates (id text PK, name text, category text, ref_url text, thumb text)
- images (optional) for storing generated image URLs
- RLS policies
- RPC public.use_one_credit(p_user_id uuid) to decrement a credit atomically

psql example:
psql "$SUPABASE_DB_URL" -f sql/000_init.sql

### 3) Seed catalog

Run:

- sql/seed.sql

psql example:
psql "$SUPABASE_DB_URL" -f sql/seed.sql

### 4) Using the API

- Credits
  - GET /api/user/credits → { plan, credits }
  - POST /api/user/credits/use → { ok, remaining? }

- Saved assets
  - GET /api/assets → { items: [...] }
  - POST /api/assets with JSON { kind: "tryon" | "template", src_urls: string[]|jsonb, copy?: json } → { item }
  - DELETE /api/assets/:id → { ok }

In mock mode or when Supabase env is not configured, these endpoints return safe defaults and the client will continue to use localStorage.

### 5) Sign-in

This starter wires the server client. Add a simple sign-in flow on the client using @supabase/supabase-js if you need authentication UI (e.g., magic links). With an active session, the APIs above will operate under Row Level Security.
