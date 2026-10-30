// Build step: render every route to its own static HTML file in dist/, with
// its own <head> (title, description, canonical, social tags, structured data),
// then write the sitemaps and robots.txt. React hydrates each page in the browser.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'build-ssr')

const { prerender } = await import(path.join(ssrDir, 'entry-server.js'))
const template = await readFile(path.join(dist, 'index.html'), 'utf8')
for (const marker of ['<!--head-->', '<div id="root"><!--app-html--></div>']) {
  if (!template.includes(marker)) throw new Error(`${marker} not found in dist/index.html`)
}

const { pages, sitemapXml, sitemapTxt, preview } = prerender()
for (const page of pages) {
  const html = template
    .replace('<!--head-->', page.head)
    .replace('<div id="root"><!--app-html--></div>', `<div id="root" data-route="${page.id}">${page.html}</div>`)
  const target = path.join(dist, page.file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, html)
}

if (preview) {
  // Preview builds must never be indexed.
  await writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  await rm(path.join(dist, 'sitemap.xml'), { force: true })
  await rm(path.join(dist, 'sitemap.txt'), { force: true })
} else {
  await writeFile(path.join(dist, 'sitemap.xml'), sitemapXml)
  await writeFile(path.join(dist, 'sitemap.txt'), sitemapTxt)
}

await rm(ssrDir, { recursive: true, force: true })
console.log(`Prerendered ${pages.length} pages${preview ? ' (preview: noindex, robots disallow, no sitemap)' : ''}: ${pages.map((p) => p.file).join(', ')}`)
