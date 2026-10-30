import { useEffect, type RefObject } from 'react'

declare global {
  interface Window {
    /** Set once the motion system has taken over; see the inline script in index.html. */
    __rancoMotion?: boolean
  }
}

const FONT_WAIT_MS = 1500

/** Page colours the sections blend between (see data-tone in HomePage). */
const TONES: Record<string, string> = { ivory: '#f4efe6', stone: '#e9e2d5', charcoal: '#15191b' }

/**
 * Cinematic but restrained motion for the homepage.
 *
 * Runs only when <html> has the "motion" class, which the inline script in
 * index.html adds unless the visitor prefers reduced motion. Without it (or
 * without JavaScript) every element is simply visible. Scrolling is never
 * taken over: the one pinned moment is short and scrubbed by the scrollbar.
 * Everything created here is reverted on unmount, and line splits are redone
 * on resize.
 */
export function useHomeMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || !document.documentElement.classList.contains('motion')) return
    window.__rancoMotion = true

    let cancelled = false
    let ctx: gsap.Context | undefined
    let mm: gsap.MatchMedia | undefined
    let refresh: (() => void) | undefined

    // GSAP loads as a separate chunk after hydration, so it never delays the first render.
    // Lines are split only after the web fonts are in, or line breaks come out wrong.
    const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONT_WAIT_MS))])
    const libs = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')])
    void Promise.all([libs, fontsReady])
      .then(([[{ gsap }, { ScrollTrigger }, { SplitText }]]) => {
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger, SplitText)
        ctx = gsap.context(() => {
          const ease = 'power3.out'
          const q = gsap.utils.selector(el)

          // Hero: the photograph settles, then the headline rises line by line.
          // The header lives outside this page's root, so it is targeted directly.
          const header = document.querySelector('[data-header]')
          gsap.set('.hero__title', { autoAlpha: 1 })
          const hero = gsap.timeline({ defaults: { ease } }).from('[data-hero-media]', { scale: 1.14, duration: 2.2, ease: 'power2.out' }, 0)
          if (header) hero.from(header, { autoAlpha: 0, y: -16, duration: 0.9 }, 0.3)
          hero
            .from(q('.hero__title .line > span'), { yPercent: 105, duration: 1.15, stagger: 0.11 }, 0.35)
            .fromTo('[data-hero-item]', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.95)

          // Headings: masked line reveals. autoSplit re-splits (and re-creates the tween) on resize.
          q('[data-lines]').forEach((heading) => {
            if (heading.classList.contains('hero__title')) return
            gsap.set(heading, { autoAlpha: 1 })
            SplitText.create(heading, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'split-line',
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 105,
                  duration: 1.1,
                  stagger: 0.09,
                  ease,
                  scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
                }),
            })
          })

          // Content: short, staggered rises.
          gsap.set('[data-reveal]', { autoAlpha: 0, y: 26 })
          ScrollTrigger.batch(q('[data-reveal]'), {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease }),
          })

          // Photographs: unveiled upward by a clipping mask while the image settles.
          q('[data-clip]').forEach((frame) => {
            const img = frame.querySelector('img, .picture')
            const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
            tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
            if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.1)
          })

          // Section colour blending: the page colour eases between tones instead of hard cuts.
          const toned = q('[data-tone]')
          if (toned.length) {
            el.classList.add('is-blending')
            toned.forEach((section) => {
              const colour = TONES[section.dataset.tone ?? ''] ?? TONES.ivory
              const blend = () => gsap.to(el, { backgroundColor: colour, duration: 0.8, ease: 'power1.inOut', overwrite: 'auto' })
              ScrollTrigger.create({ trigger: section, start: 'top 60%', end: 'bottom 60%', onEnter: blend, onEnterBack: blend })
            })
          }

          // Process: the timeline draws itself as it is read.
          const progress = el.querySelector('[data-steps-progress]')
          if (progress) {
            gsap.fromTo(
              progress,
              { scaleY: 0 },
              { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 70%', end: 'bottom 70%', scrub: true } },
            )
          }

          mm = gsap.matchMedia()

          // Tablet and up: subtle parallax on large photographs.
          mm.add('(min-width: 768px)', () => {
            gsap.to('[data-hero-media]', {
              yPercent: 10,
              ease: 'none',
              scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
            })
            gsap.fromTo(
              '[data-closing-media]',
              { yPercent: -6 },
              { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.closing__stage', start: 'top bottom', end: 'bottom top', scrub: true } },
            )
          })

          // Desktop: the signature moment, pinned for a short, scrubbed distance.
          // Each statement's photograph is unveiled over the last, and its word rises from a mask.
          mm.add('(min-width: 1024px)', () => {
            const story = el.querySelector<HTMLElement>('[data-story]')
            if (!story) return
            const panels = gsap.utils.toArray<HTMLElement>('[data-story-panel]', story)
            const ticks = gsap.utils.toArray<HTMLElement>('[data-story-tick]', story)
            story.classList.add('is-pinned')
            panels.forEach((panel, i) => gsap.set(panel, { zIndex: i + 1 }))
            gsap.set(panels.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' })
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: story, start: 'top top', end: `+=${(panels.length - 1) * 80}%`, pin: true, scrub: 0.6, anticipatePin: 1 },
            })
            panels.forEach((panel, i) => {
              const media = panel.querySelector('[data-story-media]')
              const word = panel.querySelector('.story__word > span')
              const text = panel.querySelector('.story__text')
              tl.fromTo(ticks[i], { '--p': 0 }, { '--p': 1, duration: 1 }, i)
              if (i === 0) {
                tl.fromTo(media, { scale: 1.06 }, { scale: 1, duration: 1 }, 0)
                return
              }
              const at = i - 0.55
              tl.to(panel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power2.inOut' }, at)
                .fromTo(media, { scale: 1.22 }, { scale: 1, duration: 1.2 }, at)
                .from(word, { yPercent: 100, duration: 0.45, ease: 'power3.out' }, at + 0.25)
                .from(text, { autoAlpha: 0, y: 24, duration: 0.4, ease: 'power2.out' }, at + 0.35)
            })
            return () => story.classList.remove('is-pinned')
          })

          // Below desktop: no pinning; each statement reveals as it arrives.
          mm.add('(max-width: 1023px)', () => {
            q('[data-story-panel] .story__content').forEach((content) => {
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

        // Images and late layout changes can move triggers; recalculate once everything has loaded.
        refresh = () => ScrollTrigger.refresh()
        if (document.readyState === 'complete') refresh()
        else window.addEventListener('load', refresh, { once: true })
      })
      .catch(() => {
        // If GSAP fails to load, show everything rather than leave content hidden.
        document.documentElement.classList.remove('motion')
      })

    return () => {
      cancelled = true
      if (refresh) window.removeEventListener('load', refresh)
      mm?.revert()
      ctx?.revert()
      el.classList.remove('is-blending')
    }
  }, [root])
}
