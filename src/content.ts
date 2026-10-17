export const CONTACT = {
  display: '+91\u00a098466\u00a067095',
  tel: 'tel:+919846667095',
  whatsapp: 'https://wa.me/919846667095',
} as const

export interface Slide {
  /** WebP candidates for srcset, e.g. "/assets/images/villa-1-800.webp 800w, ..." */
  webp: string
  /** Original JPEG, used as the fallback src. */
  jpg: string
  width: number
  height: number
}

// The four original photographs, in display order.
export const SLIDES: readonly Slide[] = [
  { webp: '/assets/images/villa-1-800.webp 800w, /assets/images/villa-1.webp 1080w', jpg: '/assets/images/villa-1.jpg', width: 1080, height: 1080 },
  { webp: '/assets/images/villa-2-800.webp 800w, /assets/images/villa-2.webp 1200w', jpg: '/assets/images/villa-2.jpg', width: 1200, height: 1500 },
  { webp: '/assets/images/villa-3-800.webp 800w, /assets/images/villa-3.webp 1200w', jpg: '/assets/images/villa-3.jpg', width: 1200, height: 800 },
  { webp: '/assets/images/villa-4.webp 683w', jpg: '/assets/images/villa-4.jpg', width: 683, height: 1024 },
]

/** Time each photo stays on screen before the crossfade, in ms. */
export const SLIDE_INTERVAL_MS = 7000
