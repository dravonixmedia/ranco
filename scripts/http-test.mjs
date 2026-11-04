// HTTP integration tests: runs the real Worker locally (`wrangler dev`) against
// the built dist/ and checks status codes, headers and SEO tags in each
// MAINTENANCE_MODE. Run `npm run build` first; `npm test` does not build.
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
if (!existsSync(`${root}dist/index.html`)) {
  console.error('dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

let failures = 0
function check(label, ok, detail = '') {
  if (!ok) failures++
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && detail ? ` (${detail})` : ''}`)
}

function freePort() {
  return new Promise((resolve) => {
    const srv = createServer().listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function withWorker(vars, fn) {
  const port = await freePort()
  const args = ['dev', '--port', String(port), '--ip', '127.0.0.1', ...vars.flatMap((v) => ['--var', v])]
  const child = spawn(`${root}node_modules/.bin/wrangler`, args, { cwd: root, detached: true, stdio: 'ignore' })
  const base = `http://127.0.0.1:${port}`
  try {
    for (let i = 0; ; i++) {
      try {
        await fetch(`${base}/robots.txt`)
        break
      } catch {
        if (i > 120) throw new Error('wrangler dev did not start')
        await new Promise((r) => setTimeout(r, 500))
      }
    }
    await fn(base)
  } finally {
    try {
      process.kill(-child.pid)
    } catch {
      // already exited
    }
  }
}

const get = (url, init = {}) => fetch(url, { redirect: 'manual', ...init })
const type = (res) => res.headers.get('content-type') ?? ''

async function staticFiles(base) {
  const sitemap = await get(`${base}/sitemap.xml`)
  const sitemapBody = await sitemap.text()
  check('/sitemap.xml → 200 application/xml', sitemap.status === 200 && /^(application|text)\/xml/.test(type(sitemap)), `${sitemap.status} ${type(sitemap)}`)
  check('/sitemap.xml lists https://ranco.in/', sitemapBody.includes('<loc>https://ranco.in/</loc>'))
  check('/sitemap.xml has no workers.dev URL', !sitemapBody.includes('workers.dev'))
  const robots = await get(`${base}/robots.txt`)
  check('/robots.txt → 200 with Sitemap line', robots.status === 200 && (await robots.text()).includes('Sitemap: https://ranco.in/sitemap.xml'), String(robots.status))
  const sitemapTxt = await get(`${base}/sitemap.txt`)
  check('/sitemap.txt → 200 text/plain listing https://ranco.in/', sitemapTxt.status === 200 && type(sitemapTxt).startsWith('text/plain') && (await sitemapTxt.text()).split('\n').includes('https://ranco.in/'), `${sitemapTxt.status} ${type(sitemapTxt)}`)
  const mediaFile = readdirSync(`${root}dist/_media`)[0]
  const media = await get(`${base}/_media/${mediaFile}`)
  check('/_media/* → 200 image/webp, immutable cache', media.status === 200 && type(media) === 'image/webp' && (media.headers.get('cache-control') ?? '').includes('immutable'), `${media.status} ${type(media)} ${media.headers.get('cache-control')}`)
  const favicon = await get(`${base}/favicon.ico`)
  check('/favicon.ico → 200 icon', favicon.status === 200 && type(favicon).includes('icon'), `${favicon.status} ${type(favicon)}`)
  for (const path of ['/assets/fonts/manrope-latin-wght-normal.woff2']) {
    const res = await get(`${base}${path}`)
    check(`${path} → 200`, res.status === 200, String(res.status))
  }
  const missing = await get(`${base}/assets/missing.png`)
  check('/assets/missing.png → 404', missing.status === 404, String(missing.status))
}

async function liveMode(base) {
  const home = await get(`${base}/`)
  const html = await home.text()
  check('/ → 200 text/html', home.status === 200 && type(home).startsWith('text/html'), `${home.status} ${type(home)}`)
  check('/ has no Retry-After', !home.headers.has('retry-after'))
  check('/ is not Cache-Control: no-store', !(home.headers.get('cache-control') ?? '').includes('no-store'), home.headers.get('cache-control') ?? '')
  check('/ has no X-Robots-Tag', !home.headers.has('x-robots-tag'), home.headers.get('x-robots-tag') ?? '')
  check('/ has no noindex meta', !/<meta[^>]+name=["']?(robots|googlebot)["']?[^>]*noindex/i.test(html))
  check('/ has a <title>', /<title>[^<]{10,}<\/title>/.test(html))
  check('/ has a meta description', /<meta name="description" content="[^"]{50,}">/.test(html))
  check('/ canonical is https://ranco.in/', html.includes('<link rel="canonical" href="https://ranco.in/">'))
  check('/ is prerendered (content in HTML)', html.replace(/<[^>]+>/g, '').includes('From Your First Idea to Your Dream Home.') && html.includes('tel:+919846667095') && html.includes('https://wa.me/919846667095'))
  check('/ has og:image on https://ranco.in', /<meta property="og:image" content="https:\/\/ranco\.in\/_media\/[0-9a-f]+-\d+\.webp">/.test(html))
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => m[1])
  let ld = []
  try {
    ld = blocks.map((b) => JSON.parse(b))
  } catch {
    // reported below
  }
  check('/ structured data parses (business + website + FAQ)', ld.length === 3 && ld.some((d) => d['@type'] === 'HomeAndConstructionBusiness' && d.telephone === '+91-98466-67095') && ld.some((d) => d['@type'] === 'WebSite'), `${blocks.length} blocks`)
  const faq = ld.find((d) => d['@type'] === 'FAQPage')
  const decode = (t) => t.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  const pageText = decode(html.replace(/<[^>]+>/g, ' '))
  check('/ FAQ structured data matches the questions and answers on the page', !!faq && faq.mainEntity.length > 0 && faq.mainEntity.every((q) => pageText.includes(q.name) && pageText.includes(q.acceptedAnswer.text)), faq ? `${faq.mainEntity.length} questions` : 'missing')
  check('/ hero image is preloaded', /<link rel="preload" as="image"[^>]+fetchpriority="high">/.test(html))
  const head = await get(`${base}/`, { method: 'HEAD' })
  check('HEAD / → 200', head.status === 200, String(head.status))
  const query = await get(`${base}/?utm_source=test`)
  check('/?utm_source=… → 200', query.status === 200, String(query.status))
  for (const path of ['/old-page', '/some/deep/path/', '/sitemap.xml/', '/index.php']) {
    const res = await get(`${base}${path}`)
    check(`${path} → 404`, res.status === 404, String(res.status))
  }
  const notFound = await get(`${base}/old-page`)
  const notFoundHtml = await notFound.text()
  check('404 page body is the real 404 page, noindex, no canonical', notFoundHtml.includes('This page could not be found.') && notFoundHtml.includes('<meta name="robots" content="noindex, nofollow">') && !notFoundHtml.includes('rel="canonical"'))
  const direct404 = await get(`${base}/404`)
  check('/404 itself → 404 (not a 200 soft-404)', direct404.status === 404, String(direct404.status))
  const idx = await get(`${base}/index.html`)
  check('/index.html → redirect to /', [301, 307, 308].includes(idx.status) && idx.headers.get('location') === '/', `${idx.status} ${idx.headers.get('location')}`)
  await staticFiles(base)
}

async function maintenanceMode(base) {
  for (const path of ['/', '/old-page']) {
    const res = await get(`${base}${path}`)
    check(`${path} → 503 + Retry-After + no-store`, res.status === 503 && res.headers.get('retry-after') === '259200' && (res.headers.get('cache-control') ?? '').includes('no-store'), `${res.status} ${res.headers.get('retry-after')}`)
  }
  await staticFiles(base)
}

console.log('MAINTENANCE_MODE as configured in wrangler.jsonc (production)')
await withWorker([], liveMode)
console.log('MAINTENANCE_MODE=on (temporary outage)')
await withWorker(['MAINTENANCE_MODE:on'], maintenanceMode)
console.log('MAINTENANCE_MODE=typo (fail-safe → maintenance)')
await withWorker(['MAINTENANCE_MODE:typo'], async (base) => {
  const res = await get(`${base}/`)
  check('/ → 503', res.status === 503, String(res.status))
})

console.log(failures ? `\n${failures} check(s) failed` : '\nAll HTTP checks passed')
process.exit(failures ? 1 : 0)
