import { useEffect, type RefObject } from 'react'

/**
 * Scroll-linked section transitions.
 *
 * Elements marked `data-scroll` expose their scroll progress to CSS, which
 * does all the drawing with transforms, opacity and a few clip-paths:
 *   enter  --p: 0 → 1 while the element rises into view (its first 55% of a screen)
 *   cover  --p: 0 → 1 over the whole time the element is on screen
 *   exit   --q: 0 → 1 while the element scrolls away (the hero)
 *
 * Browsers with native scroll-driven animations (animation-timeline: view())
 * get this entirely from CSS, off the JavaScript thread; see styles.css. This
 * hook is the fallback for the others: one passive scroll listener, batched
 * into animation frames, and only for elements currently near the screen.
 * Nothing runs without the "motion" class (reduced motion or no JavaScript),
 * so the CSS defaults leave every composition in its finished state.
 */
export function useScrollProgress(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || !document.documentElement.classList.contains('motion')) return
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')) return

    const items = [...el.querySelectorAll<HTMLElement>('[data-scroll]')]
    const near = new Set<HTMLElement>()
    let frame = 0

    const measure = (item: HTMLElement, vh: number) => {
      const r = item.getBoundingClientRect()
      const mode = item.dataset.scroll
      const value = mode === 'exit' ? -r.top / r.height : mode === 'cover' ? (vh - r.top) / (vh + r.height) : (vh - r.top) / (vh * 0.55)
      item.style.setProperty(mode === 'exit' ? '--q' : '--p', String(Math.min(1, Math.max(0, value))))
    }
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      near.forEach((item) => measure(item, vh))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = entry.target as HTMLElement
          if (entry.isIntersecting) near.add(item)
          else {
            // Settle elements that leave between frames (fast scrolling, anchor jumps).
            measure(item, window.innerHeight)
            near.delete(item)
          }
        }
        schedule()
      },
      { rootMargin: '25% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      items.forEach((item) => {
        item.style.removeProperty('--p')
        item.style.removeProperty('--q')
      })
    }
  }, [root])
}
