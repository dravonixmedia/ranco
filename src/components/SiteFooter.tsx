import { SITE } from '../content/site'
import { NAV } from '../content/nav'

export function SiteFooter() {
  return (
    <footer className="site-footer" data-theme="dark">
      <div className="container">
        <div className="site-footer__top">
          <p className="site-footer__statement">
            Your <em>Dream Home</em> Partner.
          </p>
          <div className="site-footer__contact">
            <a className="site-footer__phone" href={SITE.phone.tel}>
              {SITE.phone.display}
            </a>
            <a className="text-link text-link--light" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              Message on WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="site-footer__grid">
          <div>
            <a className="brand" href="/" aria-label={`${SITE.name} home`}>
              <span className="wordmark">{SITE.name}</span>{' '}
              <span className="tagline">
                {SITE.tagline}
                <span className="sep" aria-hidden="true">|</span> {SITE.region}
              </span>
            </a>
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
              <li>
                <a href="/#contact">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer__base">
          <p>© {new Date().getFullYear()} {SITE.name}. All Rights Reserved.</p>
          <a href="https://ranco.in/">ranco.in</a>
        </div>
      </div>
    </footer>
  )
}
