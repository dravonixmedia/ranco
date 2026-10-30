import { useEffect, useRef, useState } from 'react'
import { SITE } from '../content/site'

export interface NavItem {
  label: string
  href: string
}

/** Homepage section links. Interior pages replace these as they are built. */
export const NAV: NavItem[] = [
  { label: 'Services', href: '/#services' },
  { label: 'Approach', href: '/#story' },
  { label: 'Process', href: '/#process' },
  { label: 'Service Areas', href: '/#areas' },
  { label: 'FAQ', href: '/#faq' },
]

/** overlay: transparent over a dark full-screen hero until the page scrolls. */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const toggle = toggleRef.current
    document.documentElement.classList.add('menu-open')
    menuRef.current?.querySelector('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('menu-open')
      document.removeEventListener('keydown', onKey)
      toggle?.focus()
    }
  }, [open])

  return (
    <header className={`site-header ${overlay ? '' : 'site-header--solid'} ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`} data-header="">
      <div className="site-header__inner">
        <a className="brand" href="/" aria-label={`${SITE.name} home`}>
          <span className="wordmark">{SITE.name}</span>{' '}
          <span className="tagline">
            {SITE.tagline}
            <span className="sep" aria-hidden="true">|</span> {SITE.region}
          </span>
        </a>
        <nav className="site-nav" aria-label="Main">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--small btn--outline site-header__cta" href="/#contact">
          Discuss Your Project
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-toggle__bars" aria-hidden="true" />
        </button>
      </div>
      <div id="mobile-menu" className="mobile-menu" ref={menuRef} hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/#contact" onClick={() => setOpen(false)}>
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <a className="mobile-menu__phone" href={SITE.phone.tel}>
          {SITE.phone.display}
        </a>
      </div>
    </header>
  )
}
