import taxonomy from './taxonomy.json'

/**
 * "confirmed": verified with the client, published everywhere.
 * "draft": proposed wording awaiting client confirmation. Shown only in the
 * preview build (marked "Awaiting confirmation"), never in production.
 */
export type Status = 'confirmed' | 'draft'

/** Preview builds (SITE_ENV=preview) show drafts and are never indexed. */
export const IS_PREVIEW = import.meta.env.VITE_SITE_ENV === 'preview'

export const isVisible = (status: Status) => status === 'confirmed' || IS_PREVIEW

/** Verified business facts. Nothing here may be added without client confirmation. */
export const SITE = {
  name: 'RANCO',
  url: 'https://ranco.in',
  tagline: 'Your Dream Home Partner',
  region: 'Kerala',
  headline: 'From Your First Idea to Your Dream Home.',
  /** One-line positioning: the two signature services and the region. */
  positioning: 'New Home Construction & Heritage Home Renovation Across Central Kerala.',
  regionLong: 'Central Kerala',
  statement: 'Crafting Spaces. Creating Dreams.',
  phone: {
    display: '+91 98466 67095',
    tel: 'tel:+919846667095',
    e164: '+919846667095',
  },
  whatsapp: 'https://wa.me/919846667095',
  /** Target service districts from the client brief. No offices or branches exist in them. */
  districts: taxonomy.districts,
} as const

export interface Service {
  slug: string
  title: string
  status: Status
}

export const SERVICES: Service[] = taxonomy.services.map((s) => ({ ...s, status: s.status as Status }))

/** WhatsApp link with a prefilled message. Nothing is sent until the visitor presses send in WhatsApp. */
export function whatsappLink(message?: string): string {
  return message ? `${SITE.whatsapp}?text=${encodeURIComponent(message)}` : SITE.whatsapp
}
