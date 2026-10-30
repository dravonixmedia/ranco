import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { IS_PREVIEW } from './content/site'
import type { PageRoute } from './routes'

export function App({ route }: { route: PageRoute }) {
  const { Component } = route
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {IS_PREVIEW && (
        <p className="preview-bar" role="note">
          Preview build: not indexed. Items marked “Awaiting confirmation” are hidden in production.
        </p>
      )}
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Component />
      </main>
      <SiteFooter />
    </>
  )
}
