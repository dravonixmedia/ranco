export interface MediaImage {
  /** Original filename in the media/ folder. */
  file: string
  /** Default URL (about 1440px wide, or the largest available). */
  src: string
  /** Responsive candidates for srcset. */
  srcset: string
  /** Largest generated size, used for social previews. */
  largest: string
  width: number
  height: number
  /** Dominant colour, shown while the photo loads. */
  color: string
  alt: string
  decorative: boolean
}

export interface MediaProject {
  slug: string
  title: string
  district: string
  category: string
  description: string
  /** True only when project.json sets "published": true and passes validation. */
  published: boolean
  errors: string[]
}

export interface MediaManifest {
  /** Keyed by folder path under media/, e.g. "home/hero". Images are in natural filename order. */
  images: Record<string, MediaImage[]>
  projects: MediaProject[]
}
