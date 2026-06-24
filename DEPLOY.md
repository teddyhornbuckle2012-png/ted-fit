# Forge PWA — Deployment Guide

## 1. Install dependencies

```bash
npm install
```

## 2. Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 3. Production build

```bash
npm run build
```

Output is in `dist/`.

## 4. Preview the production build locally

```bash
npm run preview
```

## 5. Deploy to Cloudflare Pages

1. Push the repo to GitHub.
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) → Create a project → Connect to GitHub.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set Node.js version: 20+
6. Deploy.

Alternatively, deploy via CLI:

```bash
npm install -g wrangler
npx wrangler pages deploy dist --project-name forge-pwa
```

## 6. Icon PNG generation

The SVG icons in `public/icons/` are placeholders. For proper iOS/Android icons, generate PNGs:

```bash
npx sharp-cli --input public/icons/icon-192.svg --output public/icons/icon-192.png --width 192 --height 192
npx sharp-cli --input public/icons/icon-512.svg --output public/icons/icon-512.png --width 512 --height 512
```

Or use https://realfavicongenerator.net to generate a full icon set.

## 7. Environment variables (Phase 7 — Supabase sync)

For cloud sync (not yet implemented), create a `.env.local` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

In Cloudflare Pages, add these as environment variables in the project settings.

## 8. PWA install

On mobile:
- **iOS Safari**: tap Share → Add to Home Screen
- **Android Chrome**: tap the install banner or Menu → Install App

## 9. Offline behavior

Forge is offline-first. All workout and streak data is stored in IndexedDB via Dexie.js. The service worker (Workbox) caches all app shell assets for offline use.
