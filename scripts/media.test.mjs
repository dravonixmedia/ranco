// Tests for the build-time media pipeline (node --test).
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'
import sharp from 'sharp'
import { buildManifest, naturalCompare, renderManifestModule, variantWidths } from './media.mjs'

const temps = []
after(() => Promise.all(temps.map((d) => rm(d, { recursive: true, force: true }))))

async function mediaDir() {
  const dir = await mkdtemp(path.join(tmpdir(), 'ranco-media-'))
  temps.push(dir)
  return dir
}

async function image(dir, rel, { width = 600, height = 400, color = '#336699', format = 'jpeg' } = {}) {
  const file = path.join(dir, rel)
  await mkdir(path.dirname(file), { recursive: true })
  await sharp({ create: { width, height, channels: 3, background: color } })[format]().toFile(file)
}

async function json(dir, rel, data) {
  const file = path.join(dir, rel)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, typeof data === 'string' ? data : JSON.stringify(data))
}

const validProject = { title: 'Old house renovation', district: 'Kottayam', category: 'Heritage Home Renovation', description: 'Renovation of an existing family home, with verified details supplied by the client.', published: true }

test('natural ordering puts 2 before 10 and ignores case', () => {
  assert.deepEqual(['10-a.jpg', '2-b.jpg', '1-c.jpg', 'B.jpg', 'a.jpg'].sort(naturalCompare), ['1-c.jpg', '2-b.jpg', '10-a.jpg', 'a.jpg', 'B.jpg'])
})

test('variant widths never upscale and cap at 2560', () => {
  assert.deepEqual(variantWidths(600), [480, 600])
  assert.deepEqual(variantWidths(480), [480])
  assert.deepEqual(variantWidths(300), [300])
  assert.deepEqual(variantWidths(4000), [480, 960, 1440, 1920, 2560])
})

test('discovers new images automatically, in filename order, with dimensions', async () => {
  const dir = await mediaDir()
  await image(dir, 'home/hero/10-late.jpg')
  await image(dir, 'home/hero/2-second.png', { width: 800, height: 1200, format: 'png' })
  await image(dir, 'home/hero/1-first.webp', { format: 'webp' })
  await writeFile(path.join(dir, 'home/hero/README.md'), 'not an image')
  const { manifest } = await buildManifest({ mediaDir: dir })
  assert.deepEqual(manifest.images['home/hero'].map((i) => i.file), ['1-first.webp', '2-second.png', '10-late.jpg'])
  const second = manifest.images['home/hero'][1]
  assert.equal(second.width, 800)
  assert.equal(second.height, 1200)
  assert.match(second.srcset, /480w, .*800w$/)

  await image(dir, 'home/hero/3-added.jpg')
  const { manifest: next } = await buildManifest({ mediaDir: dir })
  assert.deepEqual(next.images['home/hero'].map((i) => i.file), ['1-first.webp', '2-second.png', '3-added.jpg', '10-late.jpg'])
})

test('replacing a file with the same name changes its URLs (no stale cache)', async () => {
  const dir = await mediaDir()
  await image(dir, 'home/hero/01-front.jpg', { color: '#aa0000' })
  const before = (await buildManifest({ mediaDir: dir })).manifest.images['home/hero'][0]
  await image(dir, 'home/hero/01-front.jpg', { color: '#00aa00' })
  const afterReplace = (await buildManifest({ mediaDir: dir })).manifest.images['home/hero'][0]
  assert.notEqual(before.src, afterReplace.src)
  assert.notEqual(before.srcset, afterReplace.srcset)
})

test('removed images and emptied folders disappear without leaving references', async () => {
  const dir = await mediaDir()
  await image(dir, 'about/gallery/01.jpg')
  await image(dir, 'about/gallery/02.jpg')
  await json(dir, 'about/gallery/images.json', { images: { '01.jpg': 'One', '02.jpg': 'Two' } })
  await rm(path.join(dir, 'about/gallery/02.jpg'))
  const { manifest, warnings } = await buildManifest({ mediaDir: dir })
  assert.deepEqual(manifest.images['about/gallery'].map((i) => i.file), ['01.jpg'])
  assert.ok(warnings.some((w) => w.includes('"02.jpg", which is not in the folder')))
  await rm(path.join(dir, 'about/gallery/01.jpg'))
  const { manifest: empty } = await buildManifest({ mediaDir: dir })
  assert.equal(empty.images['about/gallery'], undefined)
})

test('alt text comes only from images.json; missing alt is empty with a warning', async () => {
  const dir = await mediaDir()
  await image(dir, 'home/introduction/01-front-elevation.jpg')
  await image(dir, 'home/introduction/02-kitchen.jpg')
  await json(dir, 'home/introduction/images.json', { images: { '01-front-elevation.jpg': 'Front of a renovated house' } })
  const { manifest, warnings } = await buildManifest({ mediaDir: dir })
  const [first, second] = manifest.images['home/introduction']
  assert.equal(first.alt, 'Front of a renovated house')
  assert.equal(second.alt, '', 'never derived from the filename')
  assert.ok(warnings.some((w) => w.includes('02-kitchen.jpg: no alt text')))
})

test('decorative folders get empty alt without warnings', async () => {
  const dir = await mediaDir()
  await image(dir, 'shared/textures/01-plaster.jpg')
  await json(dir, 'shared/textures/images.json', { decorative: true })
  const { manifest, warnings } = await buildManifest({ mediaDir: dir })
  assert.equal(manifest.images['shared/textures'][0].decorative, true)
  assert.equal(manifest.images['shared/textures'][0].alt, '')
  assert.equal(warnings.length, 0)
})

test('unreadable files and hidden folders are skipped', async () => {
  const dir = await mediaDir()
  await image(dir, 'home/hero/01-good.jpg')
  await writeFile(path.join(dir, 'home/hero/02-broken.jpg'), 'not really a jpeg')
  await image(dir, 'home/.drafts/01.jpg')
  await image(dir, 'home/_unused/01.jpg')
  const { manifest, warnings } = await buildManifest({ mediaDir: dir })
  assert.deepEqual(manifest.images['home/hero'].map((i) => i.file), ['01-good.jpg'])
  assert.deepEqual(Object.keys(manifest.images), ['home/hero'])
  assert.ok(warnings.some((w) => w.includes('02-broken.jpg: skipped')))
})

test('writes resized WebP files into the cache with content-hashed names', async () => {
  const dir = await mediaDir()
  const cache = path.join(dir, '.cache')
  await image(dir, 'home/hero/01.jpg', { width: 1000, height: 500 })
  const { files } = await buildManifest({ mediaDir: dir, cacheDir: cache })
  assert.deepEqual((await readdir(cache)).sort(), files)
  assert.equal(files.length, 3) // 480, 960, 1000
  const meta = await sharp(path.join(cache, files.find((f) => f.endsWith('-1000.webp')))).metadata()
  assert.equal(meta.format, 'webp')
  assert.equal(meta.width, 1000)
})

test('projects stay unpublished unless explicitly published and valid', async () => {
  const dir = await mediaDir()
  // Images but no metadata: discovered, not published.
  await image(dir, 'projects/photos-only/cover/01.jpg')
  // Valid but not marked published.
  await image(dir, 'projects/draft-home/cover/01.jpg')
  await json(dir, 'projects/draft-home/project.json', { ...validProject, published: false })
  // Marked published but incomplete.
  await image(dir, 'projects/incomplete/cover/01.jpg')
  await json(dir, 'projects/incomplete/project.json', { ...validProject, description: '' })
  // Marked published, valid, but no cover photo.
  await image(dir, 'projects/no-cover/gallery/01.jpg')
  await json(dir, 'projects/no-cover/project.json', validProject)
  // Published and valid.
  await image(dir, 'projects/kottayam-renovation/cover/01.jpg')
  await image(dir, 'projects/kottayam-renovation/gallery/02.jpg')
  await image(dir, 'projects/kottayam-renovation/gallery/01.jpg')
  await json(dir, 'projects/kottayam-renovation/project.json', { ...validProject, slug: 'kottayam-renovation' })
  // Template folder is ignored.
  await image(dir, 'projects/_example-project/cover/01.jpg')

  const { manifest, warnings } = await buildManifest({ mediaDir: dir })
  const bySlug = Object.fromEntries(manifest.projects.map((p) => [p.slug, p]))
  assert.deepEqual(Object.keys(bySlug).sort(), ['draft-home', 'incomplete', 'kottayam-renovation', 'no-cover', 'photos-only'])
  assert.equal(bySlug['photos-only'].published, false)
  assert.equal(bySlug['draft-home'].published, false)
  assert.equal(bySlug['incomplete'].published, false)
  assert.equal(bySlug['no-cover'].published, false)
  assert.equal(bySlug['kottayam-renovation'].published, true)
  assert.deepEqual(manifest.images['projects/kottayam-renovation/gallery'].map((i) => i.file), ['01.jpg', '02.jpg'])
  assert.ok(warnings.some((w) => w.includes('projects/incomplete: marked published but not shown')))
  assert.ok(warnings.some((w) => w.includes('projects/no-cover') && w.includes('cover/ folder has no image')))
  assert.ok(!warnings.some((w) => w.includes('projects/draft-home: marked published')), 'unpublished drafts are not reported as failed publications')
})

test('project validation rejects unknown districts, categories and slug mismatches', async () => {
  const dir = await mediaDir()
  await image(dir, 'projects/bad-one/cover/01.jpg')
  await json(dir, 'projects/bad-one/project.json', { ...validProject, slug: 'other', district: 'Thrissur', category: 'Commercial Buildings' })
  const { manifest } = await buildManifest({ mediaDir: dir })
  const [p] = manifest.projects
  assert.equal(p.published, false)
  assert.equal(p.errors.length, 3)
})

test('generated module is valid TypeScript-style output with the manifest', async () => {
  const dir = await mediaDir()
  await image(dir, 'home/hero/01.jpg')
  const { manifest } = await buildManifest({ mediaDir: dir })
  const source = renderManifestModule(manifest)
  assert.match(source, /^\/\/ Generated by scripts\/media\.mjs/)
  assert.match(source, /export const manifest: MediaManifest = \{/)
})
