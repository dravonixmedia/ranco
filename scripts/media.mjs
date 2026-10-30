// Build-time media pipeline. Scans media/ for photographs, resizes them to
// content-hashed WebP files and writes a typed manifest the site imports.
//
//   node scripts/media.mjs manifest   manifest only (fast, used by typecheck)
//   node scripts/media.mjs build      manifest + resized images in the cache
//   node scripts/media.mjs emit       copy the resized images into dist/_media
//
// Uploading, replacing or deleting a photo in media/ needs no code change:
// the next build regenerates everything from the folder contents.
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const taxonomy = JSON.parse(await readFile(path.join(ROOT, 'src/content/taxonomy.json'), 'utf8'))

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
export const WIDTHS = [480, 960, 1440, 1920, 2560]
const MAX_WIDTH = WIDTHS[WIDTHS.length - 1]
const QUALITY = 78
const PUBLIC_PREFIX = '/_media/'

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
/** Natural order: 2-x before 10-x, case-insensitive, then exact name as a tiebreak. */
export const naturalCompare = (a, b) => collator.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0)

const isHidden = (name) => name.startsWith('.') || name.startsWith('_')
const toPosix = (p) => p.split(path.sep).join('/')

async function readJson(file, warnings) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    warnings.push(`${toPosix(path.relative(ROOT, file))}: invalid JSON (${error.message})`)
    return undefined
  }
}

/** Every folder under mediaDir that directly contains at least one image, with its images naturally sorted. */
async function scanFolders(mediaDir) {
  const folders = new Map()
  async function walk(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    const images = []
    for (const entry of entries) {
      if (isHidden(entry.name)) continue
      if (entry.isDirectory()) await walk(path.join(dir, entry.name))
      else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) images.push(entry.name)
    }
    if (images.length) folders.set(toPosix(path.relative(mediaDir, dir)), images.sort(naturalCompare))
  }
  await walk(mediaDir)
  return folders
}

/** Widths to generate: the standard steps below the source width, plus the source width (capped). */
export function variantWidths(sourceWidth) {
  const top = Math.min(sourceWidth, MAX_WIDTH)
  return [...WIDTHS.filter((w) => w < top), top]
}

async function describeImage(file) {
  const buffer = await readFile(file)
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 12)
  const image = sharp(buffer, { failOn: 'error' })
  const meta = await image.metadata()
  // EXIF orientations 5–8 are rotated 90°, so the displayed width is the stored height.
  const rotated = (meta.orientation ?? 1) >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height
  const { dominant } = await image.stats()
  const color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
  return { buffer, hash, width, height, color }
}

/**
 * Builds the manifest from mediaDir. With cacheDir set, also writes the resized
 * WebP files there (skipping ones that already exist, since names are content hashes).
 */
export async function buildManifest({ mediaDir, cacheDir } = {}) {
  const warnings = []
  const folders = await scanFolders(mediaDir)
  const images = {}
  const files = []

  for (const [folder, names] of [...folders].sort(([a], [b]) => naturalCompare(a, b))) {
    const alt = (await readJson(path.join(mediaDir, folder, 'images.json'), warnings)) ?? {}
    const altMap = alt.images ?? {}
    const folderDecorative = alt.decorative === true
    for (const listed of Object.keys(altMap)) {
      if (!names.includes(listed)) warnings.push(`media/${folder}/images.json describes "${listed}", which is not in the folder`)
    }

    images[folder] = []
    for (const name of names) {
      const source = path.join(mediaDir, folder, name)
      let info
      try {
        info = await describeImage(source)
      } catch (error) {
        warnings.push(`media/${folder}/${name}: skipped, not a readable image (${error.message})`)
        continue
      }
      const widths = variantWidths(info.width)
      const variants = widths.map((w) => ({ width: w, file: `${info.hash}-${w}.webp` }))
      if (cacheDir) {
        await mkdir(cacheDir, { recursive: true })
        for (const v of variants) {
          const target = path.join(cacheDir, v.file)
          const exists = await stat(target).then(() => true, () => false)
          if (!exists) await sharp(info.buffer).rotate().resize({ width: v.width, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(target)
        }
      }
      files.push(...variants.map((v) => v.file))

      const entry = altMap[name]
      const text = typeof entry === 'string' ? entry : entry?.alt
      const decorative = folderDecorative || (typeof entry === 'object' && entry?.decorative === true)
      if (!decorative && !text) warnings.push(`media/${folder}/${name}: no alt text in images.json (shown with empty alt)`)

      const largest = variants[variants.length - 1]
      images[folder].push({
        file: name,
        src: PUBLIC_PREFIX + (variants.find((v) => v.width >= 1440) ?? largest).file,
        srcset: variants.map((v) => `${PUBLIC_PREFIX}${v.file} ${v.width}w`).join(', '),
        largest: PUBLIC_PREFIX + largest.file,
        width: info.width,
        height: info.height,
        color: info.color,
        alt: decorative ? '' : (text ?? ''),
        decorative,
      })
    }
    if (!images[folder].length) delete images[folder]
  }

  const projects = await readProjects(mediaDir, images, warnings)
  return { manifest: { images, projects }, files: [...new Set(files)].sort(), warnings }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Project folders under media/projects. A project is published only if project.json says so and passes validation. */
async function readProjects(mediaDir, images, warnings) {
  const dir = path.join(mediaDir, 'projects')
  let entries = []
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const serviceTitles = new Set(taxonomy.services.map((s) => s.title))
  const projects = []
  for (const entry of entries.filter((e) => e.isDirectory() && !isHidden(e.name)).sort((a, b) => naturalCompare(a.name, b.name))) {
    const folder = entry.name
    const data = (await readJson(path.join(dir, folder, 'project.json'), warnings)) ?? {}
    const errors = []
    const text = (v) => (typeof v === 'string' ? v.trim() : '')
    if (!SLUG.test(folder)) errors.push('folder name must be lowercase letters, numbers and hyphens')
    if (data.slug !== undefined && data.slug !== folder) errors.push(`slug "${data.slug}" does not match folder name "${folder}"`)
    if (!text(data.title)) errors.push('title is missing')
    if (!taxonomy.districts.includes(data.district)) errors.push(`district must be one of: ${taxonomy.districts.join(', ')}`)
    if (!serviceTitles.has(data.category)) errors.push(`category must be one of: ${[...serviceTitles].join(', ')}`)
    if (text(data.description).length < 40) errors.push('description is missing or shorter than 40 characters')
    if (!images[`projects/${folder}/cover`]?.length) errors.push('cover/ folder has no image')
    const requested = data.published === true
    if (requested && errors.length) warnings.push(`media/projects/${folder}: marked published but not shown: ${errors.join('; ')}`)
    projects.push({
      slug: folder,
      title: text(data.title),
      district: text(data.district),
      category: text(data.category),
      description: text(data.description),
      published: requested && errors.length === 0,
      errors,
    })
  }
  return projects
}

export function renderManifestModule(manifest) {
  return [
    '// Generated by scripts/media.mjs from the media/ folder. Do not edit; it is rebuilt on every build.',
    "import type { MediaManifest } from '../media/types'",
    '',
    `export const manifest: MediaManifest = ${JSON.stringify(manifest, null, 2)}`,
    '',
  ].join('\n')
}

const paths = {
  media: path.join(ROOT, 'media'),
  cache: path.join(ROOT, 'node_modules/.cache/ranco-media'),
  module: path.join(ROOT, 'src/generated/media.ts'),
  list: path.join(ROOT, 'node_modules/.cache/ranco-media-files.json'),
  dist: path.join(ROOT, 'dist/_media'),
}

async function main(command) {
  if (command === 'emit') {
    const files = JSON.parse(await readFile(paths.list, 'utf8'))
    await mkdir(paths.dist, { recursive: true })
    for (const file of files) await copyFile(path.join(paths.cache, file), path.join(paths.dist, file))
    console.log(`media: copied ${files.length} image files to dist/_media`)
    return
  }
  if (command !== 'manifest' && command !== 'build') throw new Error('usage: node scripts/media.mjs manifest|build|emit')
  const { manifest, files, warnings } = await buildManifest({ mediaDir: paths.media, cacheDir: command === 'build' ? paths.cache : undefined })
  await mkdir(path.dirname(paths.module), { recursive: true })
  await writeFile(paths.module, renderManifestModule(manifest))
  if (command === 'build') {
    await mkdir(path.dirname(paths.list), { recursive: true })
    await writeFile(paths.list, JSON.stringify(files))
  }
  const count = Object.values(manifest.images).reduce((n, list) => n + list.length, 0)
  const published = manifest.projects.filter((p) => p.published).length
  console.log(`media: ${count} images in ${Object.keys(manifest.images).length} folders, ${manifest.projects.length} project folders (${published} published)`)
  for (const w of warnings) console.warn(`media warning: ${w}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main(process.argv[2])
}
