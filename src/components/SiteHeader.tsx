import { useEffect, useRef, useState } from 'react'
import { CHAPTERS, chapterNumber } from '../content/chapters'
import { SITE } from '../content/site'
import { PhoneIcon, WhatsAppIcon } from './Icons'

/** The theme ("dark" or "light") of whatever is showing under a point of the screen. */
function themeAt(x: number, y: number): string | undefined {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest('[data-header]')) continue
    const themed = el.closest<HTMLElement>('[data-theme]')
    if (themed) return themed.dataset.theme
  }
  return undefined
}

/**
 * Minimal, always-present header: chapter menu, the RANCO wordmark, and the
 * two ways to get in touch. Its colour follows the scene beneath it, so it
 * stays legible over dark and light chapters alike.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [light, setLight] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setLight(themeAt(innerWidth / 2, 36) === 'light')
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
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
    <header className={`site-header ${light && !open ? 'is-light' : ''} ${open ? 'is-open' : ''}`} data-header="">
      <div className="site-header__inner">
        <button ref={toggleRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
          <span className="menu-toggle__bars" aria-hidden="true" />
          <span className="menu-toggle__label">{open ? 'Close' : 'Menu'}</span>
        </button>
        <a className="brand" href="/" aria-label={`${SITE.name} home`}>
          <span className="wordmark">{SITE.name}</span>{' '}
          <span className="tagline">
            {SITE.tagline}
            <span className="sep" aria-hidden="true">|</span> {SITE.region}
          </span>
        </a>
        <div className="site-header__actions">
          <a className="header-action" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            <span className="header-action__label">WhatsApp</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <a className="header-action header-action--icon" href={SITE.phone.tel}>
            <PhoneIcon />
            <span className="visually-hidden">Call {SITE.phone.display}</span>
          </a>
        </div>
      </div>
      <div id="mobile-menu" className="menu" ref={menuRef} hidden={!open}>
        <nav className="menu__nav" aria-label="Chapters">
          <ol>
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a href={`/#${c.id}`} onClick={() => setOpen(false)}>
                  <span className="menu__n">{chapterNumber(c.id)}</span>
                  <span className="menu__label">{c.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu__contact">
          <p className="menu__statement">{SITE.statement}</p>
          <a className="menu__phone" href={SITE.phone.tel}>
            {SITE.phone.display}
          </a>
          <a className="text-link text-link--light" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            Message on WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <p className="menu__areas">Serving {SITE.districts.join(', ')}</p>
        </div>
      </div>
    </header>
  )
}
