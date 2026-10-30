import { IS_PREVIEW, SITE } from '../content/site'
import type { PageRoute } from '../routes'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** JSON for a <script> block: "<" is escaped so content can never close the tag. */
const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

export const absoluteUrl = (path: string) => `${SITE.url}${path}`

/** Per-route <head> tags, injected into index.html by scripts/prerender.mjs. */
export function renderHead(route: PageRoute): string {
  const tags: string[] = []
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  const url = absoluteUrl(route.path)
  tags.push(`<title>${title}</title>`, `<meta name="description" content="${description}">`)

  if (IS_PREVIEW || !route.indexable) tags.push('<meta name="robots" content="noindex, nofollow">')
  if (route.indexable) tags.push(`<link rel="canonical" href="${url}">`)

  tags.push(
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    '<meta property="og:locale" content="en_IN">',
  )
  if (route.indexable) tags.push(`<meta property="og:url" content="${url}">`)
  tags.push('<meta name="twitter:card" content="summary_large_image">')

  const image = route.heroImage
  if (image) {
    tags.push(
      `<meta property="og:image" content="${absoluteUrl(image.largest)}">`,
      `<meta property="og:image:width" content="${image.width}">`,
      `<meta property="og:image:height" content="${image.height}">`,
    )
    if (image.alt) tags.push(`<meta property="og:image:alt" content="${escapeHtml(image.alt)}">`)
    tags.push(`<link rel="preload" as="image" type="image/webp" href="${image.src}" imagesrcset="${image.srcset}" imagesizes="100vw" fetchpriority="high">`)
  }

  for (const data of route.jsonLd ?? []) tags.push(`<script type="application/ld+json">${safeJson(data)}</script>`)
  return tags.join('\n')
}

/** XML sitemap of indexable routes only. */
export function renderSitemapXml(routes: PageRoute[]): string {
  const urls = routes.filter((r) => r.indexable).map((r) => `  <url>\n    <loc>${escapeHtml(absoluteUrl(r.path))}</loc>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function renderSitemapTxt(routes: PageRoute[]): string {
  return routes
    .filter((r) => r.indexable)
    .map((r) => `${absoluteUrl(r.path)}\n`)
    .join('')
}
