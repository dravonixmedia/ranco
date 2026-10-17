# RANCO — maintenance page

The https://ranco.in maintenance page: React + TypeScript + Vite, deployed as a
Cloudflare Worker with Static Assets.

```
index.html                 Vite entry: <head> (title, SEO, Open Graph, JSON-LD, preloads)
src/
  main.tsx                 browser entry (hydrates the prerendered HTML)
  entry-server.tsx         build-time render used by scripts/prerender.mjs
  App.tsx                  page layout
  content.ts               contact details, photo list, slide interval
  styles.css               all styling
  hooks/useSlideshow.ts    crossfade timing, lazy photo loading, tab-hidden pause
  hooks/usePrefersReducedMotion.ts
  components/
    BackgroundSlideshow.tsx  the four photos (WebP + original JPEG fallback)
    SiteHeader.tsx           RANCO wordmark, tagline, "Back shortly"
    MaintenanceContent.tsx   heading, text, enquiries number
    ContactActions.tsx       Call Now / WhatsApp buttons
    SiteFooter.tsx           copyright, slide progress bars, ranco.in
public/                    copied to dist/ unchanged
  assets/images/           original photos villa-1..4.jpg + WebP copies
  assets/fonts/            self-hosted Manrope + Cormorant Garamond (OFL)
  _headers                 security headers, 7-day cache for /assets/*
  robots.txt               crawling allowed
scripts/prerender.mjs      writes the rendered page into dist/index.html
worker/index.ts            Worker: serves dist/, applies maintenance mode
wrangler.jsonc             Worker + assets config, MAINTENANCE_MODE variable
```

The page is prerendered at build time, so its text, links and first photo are in
the HTML before any JavaScript runs. React then hydrates it to run the slideshow.

## Commands

```sh
npm install
npm run dev         # Vite dev server with hot reload (no Worker, no 503)
npm run typecheck   # tsc for app, worker and Vite config
npm run lint        # ESLint
npm run build       # typecheck + build + prerender → dist/
npm run preview     # build, then run the real Worker locally (wrangler dev)
npm run check       # typecheck + lint + build + `wrangler deploy --dry-run`
npx wrangler deploy # production deploy (needs Cloudflare login/API token)
```

## Cloudflare Workers Builds settings

Workers & Pages → the `ranco` Worker → Settings → Build:

| Setting | Value |
|---|---|
| Git repository | `dravonixmedia/ranco` |
| Branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` (blank) |

The Worker's name in the dashboard must match `"name"` in `wrangler.jsonc` (`ranco`).

## Maintenance mode

Set in `wrangler.jsonc` → `vars`:

| `MAINTENANCE_MODE` | Pages (`/`, any other path) | `/assets/*`, `robots.txt` |
|---|---|---|
| `"on"` | **503** + `Retry-After` + the maintenance page | 200 |
| `"off"` (or missing) | **200** for `/`, 404 for unknown paths | 200 |

`MAINTENANCE_RETRY_AFTER_SECONDS` (default `259200`, 3 days) sets `Retry-After`.

To change it in production, edit the value in `wrangler.jsonc`, commit, and push to
`main`; Workers Builds redeploys. Change it in the file, not in the dashboard:
`wrangler deploy` replaces dashboard variables with the ones in `wrangler.jsonc`.

Only the exact value `"on"` enables maintenance, so a missing or mistyped value
serves the site normally rather than leaving it stuck on 503. When the full website
launches, set `"off"` (or remove the Worker logic). Don't leave the 503 in place for
more than a couple of weeks: search engines may start dropping pages.
