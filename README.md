# RANCO website

https://ranco.in: React + TypeScript + Vite, prerendered to static HTML per page
and served by a Cloudflare Worker with Static Assets.

- `MEDIA_GUIDE.md`: adding, replacing and removing photographs (no code needed)
- `docs/ARCHITECTURE.md`: audit, architecture and staged plan
- `docs/CONTENT_REVIEW.md`: content awaiting client confirmation

```
media/                     photographs, organised by page and section (see MEDIA_GUIDE.md)
index.html                 HTML template (shared head, fonts, motion opt-in script)
src/
  routes.tsx               pages: path, output file, title, description, structured data
  seo/head.ts              per-page <head> tags and sitemap generation
  content/                 verified facts (site.ts), services and districts (taxonomy.json), copy (home.ts)
  media/                   image manifest types and helpers (getImage, getImages)
  generated/media.ts       image manifest, generated on every build (not committed)
  pages/                   HomePage, NotFoundPage
  components/              header, footer, Picture, EnquiryForm, Draft, icons
  motion/useHomeMotion.ts  GSAP/ScrollTrigger animation (lazy-loaded)
  styles.css               design system
public/                    fonts, favicon, robots.txt, _headers (copied to dist/)
scripts/
  media.mjs                scans media/, resizes images, writes the manifest
  prerender.mjs            writes one HTML file per page plus sitemaps
  http-test.mjs            HTTP integration tests (npm test)
  media.test.mjs           media pipeline tests (npm run test:unit)
worker/index.ts            Worker: serves dist/, maintenance mode, 404 handling
wrangler.jsonc             Worker and assets config, MAINTENANCE_MODE variable
```

## Commands

```sh
npm install
npm run dev            # Vite dev server (no Worker, no prerender)
npm run typecheck      # manifest + tsc
npm run lint           # ESLint
npm run test:unit      # media pipeline tests
npm run build          # production build → dist/
npm run build:preview  # preview build: drafts shown, noindex, robots disallow, no sitemap
npm test               # HTTP integration tests against dist/ (build first)
npm run check          # typecheck + lint + unit tests + build + HTTP tests + deploy dry-run
```

## Cloudflare Workers Builds settings

Workers & Pages → the `ranco` Worker → Settings → Build:

| | Production (`main`) | Preview builds (every other branch) |
|---|---|---|
| Build command (shared) | `npm run build` | `npm run build` |
| Deploy step | `npx wrangler deploy` | Preview command `npx wrangler preview` |

Git-triggered preview builds run the same build command as production; only the
deploy step differs. `npm run build` therefore chooses the output itself from the
branch Workers Builds reports (`WORKERS_CI_BRANCH`):

- on `main`: the production build;
- on any other branch: `npm run build:preview` (drafts shown, `noindex`,
  `X-Robots-Tag`, `robots.txt` disallow, no sitemap), which refuses to run on `main`.

`npx wrangler preview` creates a Worker Preview (its own workers.dev URL) and never
replaces production. Previews take their settings from the `previews` block in
`wrangler.jsonc`, not the top level.

Production is also protected at deploy time. `wrangler.jsonc` runs
`scripts/ci-guard.mjs` as a custom build step before Wrangler uploads anything:
`wrangler deploy` is refused in Workers Builds on any branch but `main`, and a
preview build is refused by `wrangler deploy` everywhere, including locally.

Node.js 22 is pinned in `.node-version` (Vite 8 needs Node 20.19+ or 22.12+).

The Worker's name in the dashboard must match `"name"` in `wrangler.jsonc` (`ranco`).

## Maintenance mode

Production state: **off**. The coming-soon page is served as a normal, indexable
page. Set in `wrangler.jsonc` → `vars`:

| `MAINTENANCE_MODE` | `/` | Unknown URLs | `/assets/*`, `/_media/*`, `favicon.ico`, `robots.txt`, sitemaps |
|---|---|---|---|
| `"off"` (production) | **200** | **404** | 200 |
| `"on"` | **503** + `Retry-After` | 503 (maintenance page) | 200 |
| missing, empty or anything else | treated as `"on"`, warning logged | 503 | 200 |

Use `"on"` only for a genuine temporary outage, and switch back to `"off"` as soon
as it ends: Google reduces crawling of a hostname that keeps returning 503.

The switch is fail-safe: only the exact value `"off"` (case and surrounding spaces
ignored) serves the site normally, so never delete the line.

`MAINTENANCE_RETRY_AFTER_SECONDS` (default `259200`, 3 days) sets `Retry-After`
while `"on"`; an invalid value falls back to 3 days.

To change it in production, edit the value in `wrangler.jsonc`, commit, and push to
`main`; Workers Builds redeploys. Change it in the file, not in the dashboard:
`wrangler deploy` replaces dashboard variables with the ones in `wrangler.jsonc`.

## Tests

`npm test` starts the Worker locally with `wrangler dev` against `dist/` (run
`npm run build` first) and checks status codes, headers and SEO tags in each
mode. `npm run check` runs typecheck, lint, build, tests and a deploy dry-run.
