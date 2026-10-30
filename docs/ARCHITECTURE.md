# RANCO website: audit and architecture

## Audit (October 2026)

- **Production:** `main` at `ccb41ec`, deployed by Cloudflare Workers Builds
  (`npm run build`, then `npx wrangler deploy`) to the Worker `ranco`, which
  serves `dist/` as static assets. The live site is a single prerendered
  coming-soon page.
- **Stack:** React 19, TypeScript, Vite 8, Workers Static Assets, Wrangler 4. No
  CMS or database.
- **Branch safety:** pushes to the development branch were previously found to
  deploy straight to production. The Cloudflare connector available here
  cannot read the build and branch-control settings, so this work stays on a
  local branch (`feature/premium-website`) until those settings are confirmed.
- **Verified facts and open questions:** see `docs/CONTENT_REVIEW.md`.

## Architecture

### Pages: multi-page static generation
Every route is rendered to its own HTML file at build time
(`scripts/prerender.mjs`), with its own title, description, canonical URL,
Open Graph tags and structured data (`src/seo/head.ts`). React hydrates each
page for interactivity. Navigation uses ordinary links, so direct URLs,
back/forward and crawling work without client-side routing, and animations
are torn down cleanly between pages.

- Routes are registered in `src/routes.tsx`. `about.html` is served at
  `/about` by Workers Static Assets.
- The sitemap (`sitemap.xml`, `sitemap.txt`) is generated from indexable routes
  only.
- Unknown URLs return the real 404 page with status 404
  (`not_found_handling: "404-page"`); `/404` itself also returns 404.

### Content model
- `src/content/site.ts`: verified business facts only.
- `src/content/taxonomy.json`: districts and services, each with a status.
- `src/content/home.ts`: homepage copy, each item with a status.
- Status `"draft"` content is rendered only in the preview build
  (`npm run build:preview`), marked "Awaiting confirmation". Production never
  includes it.

### Media pipeline (`scripts/media.mjs`)
`media/` (at the repository root, so originals are not deployed) → scanned on
every build → content-hashed WebP sizes (480–2560 px) in `dist/_media/`
(immutable cache) → typed manifest `src/generated/media.ts` (not committed).
Components ask for images by folder (`getImage('home/hero')`). Projects are
discovered from folders but published only when `project.json` is complete,
valid and `"published": true`. Tests: `scripts/media.test.mjs`. User guide:
`MEDIA_GUIDE.md`.

### Motion (`src/motion/useHomeMotion.ts`)
GSAP, ScrollTrigger and SplitText, loaded as a separate chunk after hydration.
Lenis is not used: native scrolling keeps touch, keyboard, anchor links and
accessibility intact.

- **Hero:** image settles, navigation fades in, headline reveals line by line,
  then the statement and the buttons.
- **Headings:** masked line reveals; content: short staggered fade-ups.
- **Tablet and up:** subtle image parallax.
- **Desktop (1024 px and up):** one short pinned sequence, "Your Vision. Our
  Craft. Your Home.". Smaller screens get simple reveals with no pinning.
- **Fallbacks:** reduced-motion users, no-JavaScript visitors, and a 3-second
  safety timeout all see static, fully visible content.

### Enquiries
`EnquiryForm` validates name, phone, district, work type and details, then
opens WhatsApp with the message prefilled. It states that nothing has been sent
until the visitor presses send. Nothing is stored. A server-side email route
can be added once a destination and provider are approved.

### Preview and production
- `npm run build:preview`: drafts visible, every page `noindex, nofollow`,
  `robots.txt` disallows all, no sitemap, preview banner shown.
- `npm run build`: production; drafts excluded.

## Staged plan

| Stage | Scope | Status |
|---|---|---|
| 1 Audit | Repository, deployment, verified facts | Done |
| 2 Architecture | This document; content and media models | Done |
| 3 Homepage | Cinematic homepage with all 10 sections | Done (draft content pending confirmation) |
| 5 Media | Folder discovery, manifest, resizing, projects, guide, tests | Done |
| 4 Interior pages | About, Services and service pages, Projects and project pages, Process, Service Areas, Contact, Privacy | Next; needs confirmed services and process |
| 6 SEO/AEO/GEO | Per-page structured data (BreadcrumbList, Service), district content, internal linking | With stage 4 |
| 7 QA | Full matrix at 320–1920 px, keyboard, reduced motion, structured-data validation | Continuous; full pass before preview |
| 8 Preview | Non-indexed preview deployment | Needs a confirmed-safe preview target |
| 9 Production | Merge to `main` | Only with explicit approval |
