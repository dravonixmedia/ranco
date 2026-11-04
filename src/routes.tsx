import type { ComponentType } from 'react'
import { FAQS } from './content/home'
import { SERVICES, SITE } from './content/site'
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
  description: 'New home construction and heritage home renovation for homeowners in Central Kerala: Kottayam, Pathanamthitta, Idukki and Ernakulam.',
  areaServed: SITE.districts.map((d) => ({ '@type': 'AdministrativeArea', name: `${d} district, Kerala, India` })),
  // The two services offered; no prices, ratings or credentials are claimed.
  makesOffer: SERVICES.filter((s) => s.status === 'confirmed').map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: s.title, areaServed: 'Central Kerala, India' },
  })),
}

/** Questions and answers exactly as they appear on the page (confirmed items only). */
const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.filter((f) => f.status === 'confirmed').map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
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
    title: 'RANCO | Home Construction & Heritage Home Renovation in Central Kerala',
    description:
      'From your first idea to your dream home: RANCO builds new homes and renovates traditional Kerala homes for families in Kottayam, Pathanamthitta, Idukki and Ernakulam.',
    Component: HomePage,
    heroImage: getImage('home/hero'),
    jsonLd: [business, website, faqPage],
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
