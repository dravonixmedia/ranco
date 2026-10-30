import { useEffect, type RefObject } from 'react'

declare global {
  interface Window {
    /** Set once the motion system has taken over; see the inline script in index.html. */
    __rancoMotion?: boolean
  }
}

const FONT_WAIT_MS = 1500

/**
 * Cinematic but restrained motion for the homepage.
 *
 * Runs only when <html> has the "motion" class, which the inline script in
 * index.html adds unless the visitor prefers reduced motion. Without it (or
 * without JavaScript) every element is simply visible. Everything created
 * here is reverted on unmount.
 */
export function useHomeMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || !document.documentElement.classList.contains('motion')) return
    window.__rancoMotion = true

    let cancelled = false
    let ctx: gsap.Context | undefined
    let mm: gsap.MatchMedia | undefined

    // GSAP loads as a separate chunk after hydration, so it never delays the first render.
    // Lines are split only after the web fonts are in, or line breaks come out wrong.
    const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONT_WAIT_MS))])
    const libs = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')])
    void Promise.all([libs, fontsReady]).then(([[{ gsap }, { ScrollTrigger }, { SplitText }]]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger, SplitText)
      ctx = gsap.context(() => {
        const ease = 'power3.out'

        // Hero: image, navigation, headline line by line, statement, actions, scroll cue.
        const heroLines = el.querySelectorAll('.hero__title .line > span')
        // The header lives outside this page's root, so target it directly rather than by scoped selector.
        const header = document.querySelector('[data-header]')
        gsap.set('.hero__title', { autoAlpha: 1 })
        const hero = gsap.timeline({ defaults: { ease } }).from('[data-hero-media]', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0)
        if (header) hero.from(header, { autoAlpha: 0, y: -16, duration: 0.9 }, 0.35)
        hero
          .from(heroLines, { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.5)
          .fromTo('[data-hero-item]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14 }, 1.05)

        // Section headings: masked line reveals as they enter.
        el.querySelectorAll<HTMLElement>('[data-lines]').forEach((heading) => {
          if (heading.classList.contains('hero__title')) return
          const split = SplitText.create(heading, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
          gsap.set(heading, { autoAlpha: 1 })
          gsap.from(split.lines, {
            yPercent: 110,
            duration: 1,
            stagger: 0.1,
            ease,
            scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
          })
        })

        // Content: short, staggered fade-up reveals.
        gsap.set('[data-reveal]', { autoAlpha: 0, y: 28 })
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 90%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease }),
        })

        mm = gsap.matchMedia()

        // Tablet and up: subtle architectural parallax.
        mm.add('(min-width: 768px)', () => {
          gsap.to('[data-hero-media]', {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
          })
          el.querySelectorAll<HTMLElement>('[data-parallax]').forEach((frame) => {
            const img = frame.querySelector('img')
            if (!img) return
            gsap.fromTo(
              img,
              { yPercent: -6, scale: 1.12 },
              { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
            )
          })
        })

        // Desktop: one short pinned sequence — Your Vision. Our Craft. Your Home.
        mm.add('(min-width: 1024px)', () => {
          const story = el.querySelector<HTMLElement>('[data-story]')
          if (!story) return
          const panels = gsap.utils.toArray<HTMLElement>('[data-story-panel]', story)
          story.classList.add('is-pinned')
          gsap.set(panels.slice(1), { autoAlpha: 0 })
          const tl = gsap.timeline({
            scrollTrigger: { trigger: story, start: 'top top', end: `+=${(panels.length - 1) * 75}%`, pin: true, scrub: 0.6, anticipatePin: 1 },
          })
          panels.forEach((panel, i) => {
            const media = panel.querySelector('[data-story-media]')
            tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 1, ease: 'none' }, i)
            if (i === 0) return
            tl.to(panels[i - 1], { autoAlpha: 0, duration: 0.5 }, i - 0.25)
              .to(panel, { autoAlpha: 1, duration: 0.5 }, i - 0.25)
              .from(panel.querySelectorAll('.story__word, .story__text'), { y: 40, duration: 0.6, stagger: 0.1 }, i - 0.15)
          })
          return () => story.classList.remove('is-pinned')
        })

        // Below desktop: no pinning, each statement simply reveals in turn.
        mm.add('(max-width: 1023px)', () => {
          el.querySelectorAll<HTMLElement>('[data-story-panel] .story__content').forEach((content) => {
            gsap.from(content.children, {
              autoAlpha: 0,
              y: 24,
              duration: 0.8,
              stagger: 0.1,
              ease,
              scrollTrigger: { trigger: content, start: 'top 85%', once: true },
            })
          })
        })
      }, el)
      // Layout can shift once images decode; keep trigger positions accurate.
      ScrollTrigger.refresh()
    }).catch(() => {
      // If GSAP fails to load, show everything rather than leave content hidden.
      document.documentElement.classList.remove('motion')
    })

    return () => {
      cancelled = true
      mm?.revert()
      ctx?.revert()
    }
  }, [root])
}
