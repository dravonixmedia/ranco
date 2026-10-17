// Build step: render <App /> to static HTML inside dist/index.html, so the
// page (text, links, first photo) is visible before — and without — JavaScript,
// exactly like the original static page. React then hydrates it in the browser.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const htmlPath = `${root}dist/index.html`
const ssrDir = `${root}build-ssr`

const { render } = await import(`${ssrDir}/entry-server.js`)
const template = await readFile(htmlPath, 'utf8')
const placeholder = '<!--app-html-->'
if (!template.includes(placeholder)) throw new Error(`${placeholder} not found in dist/index.html`)

await writeFile(htmlPath, template.replace(placeholder, render()))
await rm(ssrDir, { recursive: true, force: true })
console.log('Prerendered dist/index.html')
