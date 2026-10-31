import { useEffect, type RefObject } from 'react'

declare global {
  interface Window {
    /** Set once the motion system has taken over; see the inline script in index.html. */
    __rancoMotion?: boolean
  }
}

/**
 * Quiet entrance reveals: elements marked `data-reveal` fade and rise once as
 * they enter the screen (`data-reveal="image"` also settles its photograph).
 *
 * Runs only when <html> has the "motion" class, which the inline script in
 * index.html adds unless the visitor prefers reduced motion. Without it (or
 * without JavaScript) everything is simply visible. One IntersectionObserver,
 * CSS transitions, no animation library and no scroll listeners.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || !document.documentElement.classList.contains('motion')) return
    window.__rancoMotion = true
    const items = el.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [root])
}
