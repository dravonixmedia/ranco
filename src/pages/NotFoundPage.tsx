import { SITE } from '../content/site'

export function NotFoundPage() {
  return (
    <section className="section section--ivory not-found" data-theme="light" aria-labelledby="not-found-title">
      <div className="container not-found__inner">
        <p className="eyebrow">Error 404</p>
        <h1 id="not-found-title" className="display display--lg">
          This page could not be found.
        </h1>
        <p className="lede">The address may have changed, or the page may no longer exist.</p>
        <div className="not-found__actions">
          <a className="btn btn--dark" href="/">
            Go to the homepage
          </a>
          <a className="text-link" href={SITE.phone.tel}>
            Call {SITE.phone.display}
          </a>
        </div>
      </div>
    </section>
  )
}
