# RANCO — maintenance page

Static maintenance page for https://ranco.in, built for Cloudflare Pages.

```
public/                  ← Pages build output directory (deployed as-is)
  index.html             page, inline CSS + JS, no dependencies
  _headers               security + asset cache headers
  robots.txt             crawling allowed (no deindexing)
  assets/images/         original photos (villa-1..4.jpg) + WebP copies
  assets/fonts/          self-hosted Manrope + Cormorant Garamond (OFL)
functions/_middleware.js returns HTML with 503 + Retry-After during maintenance
wrangler.toml            Pages project config
```

## Local preview

```sh
npx wrangler pages dev        # http://localhost:8788 (includes the 503 middleware)
```

## Deploy (Cloudflare Pages)

Dashboard (Git integration): Workers & Pages → Create → Pages → connect this repo.
- Framework preset: None
- Build command: *(leave empty)*
- Build output directory: `public`

Or with the CLI: `npx wrangler pages deploy` (uses `wrangler.toml`).

Then add the custom domain `ranco.in` (and `www.ranco.in` if wanted) under the
project's **Custom domains** tab. Cloudflare creates the DNS record when you confirm.

## Maintenance status code

While live, every HTML response is `503 Service Unavailable` with
`Retry-After: 259200` (3 days) so search engines keep existing rankings.
Images and fonts are served normally with `200`.

When the full site launches, delete `functions/_middleware.js` — or set the
Pages environment variable `MAINTENANCE_MODE=off` and redeploy.
If the 503 stays in place for more than a couple of weeks, search engines may
start dropping the page, so remove it once the outage is no longer temporary.
