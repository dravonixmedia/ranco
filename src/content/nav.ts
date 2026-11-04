import { getPublishedProjects } from '../media'
import { IS_PREVIEW } from './site'

export interface NavItem {
  label: string
  href: string
}

/** Projects appear only once a verified project is published (the preview always shows the section). */
export const SHOW_PROJECTS = getPublishedProjects().length > 0 || IS_PREVIEW

/** Homepage sections, in page order. */
export const NAV: NavItem[] = [
  { label: 'About', href: '/#about' },
  { label: 'Journey', href: '/#journey' },
  { label: 'Expertise', href: '/#expertise' },
  ...(SHOW_PROJECTS ? [{ label: 'Our Work', href: '/#work' }] : []),
  { label: 'Where We Work', href: '/#areas' },
  { label: 'FAQ', href: '/#faq' },
]
