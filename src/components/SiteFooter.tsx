import { SITE } from '../content/site'
import { NAV } from './SiteHeader'

export function SiteFooter() {
  return (
    <footer className="site-footer" data-theme="dark">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <a className="brand" href="/" aria-label={`${SITE.name} home`}>
            <span className="wordmark">{SITE.name}</span>{' '}
            <span className="tagline">
              {SITE.tagline}
              <span className="sep" aria-hidden="true">|</span> {SITE.region}
            </span>
          </a>
          <p className="site-footer__statement">{SITE.statement}</p>
        </div>
        <div>
          <h2 className="site-footer__heading">Contact</h2>
          <ul className="site-footer__list">
            <li>
              <a href={SITE.phone.tel}>{SITE.phone.display}</a>
            </li>
            <li>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="site-footer__heading">Service areas</h2>
          <ul className="site-footer__list">
            {SITE.districts.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="site-footer__heading">Explore</h2>
          <ul className="site-footer__list">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container site-footer__base">
        <p>© {new Date().getFullYear()} {SITE.name}. All Rights Reserved.</p>
        <a href="https://ranco.in/">ranco.in</a>
      </div>
    </footer>
  )
}
