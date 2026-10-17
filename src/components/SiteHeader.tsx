export function SiteHeader() {
  return (
    <header className="top">
      <a className="brand" href="/" aria-label="RANCO home">
        <span className="wordmark">RANCO</span>{' '}
        <span className="tagline">
          Villa &amp; Apartment Renovation<span className="sep" aria-hidden="true">|</span> Kerala
        </span>
      </a>
      <span className="status">Back shortly</span>
    </header>
  )
}
