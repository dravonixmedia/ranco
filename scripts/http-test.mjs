// HTTP integration tests: runs the real Worker locally (`wrangler dev`) against
// the built dist/ and checks status codes, headers and SEO tags in each
// MAINTENANCE_MODE. Run `npm run build` first; `npm test` does not build.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
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
  const favicon = await get(`${base}/favicon.ico`)
  check('/favicon.ico → 200 icon', favicon.status === 200 && type(favicon).includes('icon'), `${favicon.status} ${type(favicon)}`)
  for (const path of ['/assets/images/villa-1.jpg', '/assets/fonts/manrope-latin-wght-normal.woff2']) {
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
  check('/ is prerendered (content in HTML)', html.includes('Website Under') && html.includes('tel:+919846667095') && html.includes('https://wa.me/919846667095'))
  const head = await get(`${base}/`, { method: 'HEAD' })
  check('HEAD / → 200', head.status === 200, String(head.status))
  const query = await get(`${base}/?utm_source=test`)
  check('/?utm_source=… → 200', query.status === 200, String(query.status))
  for (const path of ['/old-page', '/some/deep/path/', '/sitemap.xml/', '/index.php']) {
    const res = await get(`${base}${path}`)
    check(`${path} → 404`, res.status === 404, String(res.status))
  }
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
