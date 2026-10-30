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

/** Projects that are explicitly published and pass validation. */
export function getPublishedProjects(): MediaProject[] {
  return manifest.projects.filter((p) => p.published)
}
