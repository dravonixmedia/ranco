import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { IS_PREVIEW } from './content/site'
import { ROUTES } from './routes'
import { renderHead, renderSitemapTxt, renderSitemapXml } from './seo/head'

export interface PrerenderPage {
  id: string
  file: string
  head: string
  html: string
}

/** Every page as static HTML, plus the generated sitemaps (used by scripts/prerender.mjs). */
export function prerender(): { pages: PrerenderPage[]; sitemapXml: string; sitemapTxt: string; preview: boolean } {
  const pages = ROUTES.map((route) => ({
    id: route.id,
    file: route.file,
    head: renderHead(route),
    html: renderToString(
      <StrictMode>
        <App route={route} />
      </StrictMode>,
    ),
  }))
  return { pages, sitemapXml: renderSitemapXml(ROUTES), sitemapTxt: renderSitemapTxt(ROUTES), preview: IS_PREVIEW }
}
