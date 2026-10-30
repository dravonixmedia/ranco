import { manifest } from '../generated/media'
import type { MediaImage, MediaProject } from './types'

export type { MediaImage, MediaProject }

/** All images in a media/ folder, in filename order (01-…, 02-…). Empty if the folder has none. */
export function getImages(folder: string): MediaImage[] {
  return manifest.images[folder] ?? []
}

/** The single image for a slot: always the first file in filename order. */
export function getImage(folder: string): MediaImage | undefined {
  return getImages(folder)[0]
}

/**
 * Images for a slot, or a deterministic fallback while its own folder is empty.
 * The fallback list is taken from `fallbackFolder`, skipping its first `skip` images.
 */
export function getImagesOr(folder: string, fallbackFolder: string, skip = 0): MediaImage[] {
  const own = getImages(folder)
  return own.length ? own : getImages(fallbackFolder).slice(skip)
}

/** Projects that are explicitly published and pass validation. */
export function getPublishedProjects(): MediaProject[] {
  return manifest.projects.filter((p) => p.published)
}
