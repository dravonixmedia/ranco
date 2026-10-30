import type { ComponentType } from 'react'
import { SITE } from './content/site'
import { getImage, type MediaImage } from './media'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

export interface PageRoute {
  id: string
  /** Public URL path; also the canonical path. */
  path: string
  /** Output file in dist/ (Workers assets serve about.html at /about). */
  file: string
  /** Listed in the sitemap and indexable. False for 404 and utility pages. */
  indexable: boolean
  title: string
  description: string
  Component: ComponentType
  /** Above-the-fold image: preloaded and used for social previews. */
  heroImage?: MediaImage
  jsonLd?: object[]
}

const business = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${SITE.url}/#business`,
  name: SITE.name,
  url: `${SITE.url}/`,
  telephone: '+91-98466-67095',
  slogan: `${SITE.tagline} | ${SITE.region}`,
  description: 'Home renovation for homeowners in Kottayam, Pathanamthitta, Idukki and Ernakulam, Kerala.',
  areaServed: SITE.districts.map((d) => ({ '@type': 'AdministrativeArea', name: `${d} district, Kerala, India` })),
}

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: `${SITE.url}/`,
  publisher: { '@id': `${SITE.url}/#business` },
}

export const ROUTES: PageRoute[] = [
  {
    id: 'home',
    path: '/',
    file: 'index.html',
    indexable: true,
    title: 'RANCO | Build Your Dream Home in Kerala',
    description:
      "Bring your dream home to life with RANCO. Discover thoughtful residential solutions, quality workmanship, and a commitment to creating spaces you'll love.",
    Component: HomePage,
    heroImage: getImage('home/hero'),
    jsonLd: [business, website],
  },
  {
    id: 'not-found',
    path: '/404',
    file: '404.html',
    indexable: false,
    title: 'Page not found | RANCO',
    description: 'The page you were looking for could not be found.',
    Component: NotFoundPage,
  },
]

export const routeById = (id: string) => ROUTES.find((r) => r.id === id)

/** Route for a browser path, used by the dev server (production pages carry data-route). */
export function routeForPath(pathname: string): PageRoute {
  const clean = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1')
  return ROUTES.find((r) => r.path === clean && r.indexable) ?? ROUTES.find((r) => r.id === 'not-found')!
}
