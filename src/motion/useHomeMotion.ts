import { useEffect, type RefObject } from 'react'
import { APERTURE_FULL } from '../components/Roofline'

declare global {
  interface Window {
    /** Set once the motion system has taken over; see the inline script in index.html. */
    __rancoMotion?: boolean
  }
}

type Gsap = typeof import('gsap').gsap
type ScrollTriggerType = typeof import('gsap/ScrollTrigger').ScrollTrigger
type SplitTextType = typeof import('gsap/SplitText').SplitText

const FONT_WAIT_MS = 1500
const DESKTOP = '(min-width: 1024px)'
const TABLET_UP = '(min-width: 768px)'
const BELOW_DESKTOP = '(max-width: 1023px)'

/**
 * Stage a scene: the section grows to `heightSvh` and its stage sticks to the
 * screen while the scene plays, so scrolling stays native. With `curtain`, the
 * following scene slides over the stage's last screen.
 */
function stage(section: HTMLElement, heightSvh: number, curtain: boolean) {
  section.classList.add('is-staged')
  section.style.setProperty('--stage-h', `${heightSvh}svh`)
  const next = curtain ? (section.nextElementSibling as HTMLElement | null) : null
  next?.classList.add('is-curtain')
  return () => {
    section.classList.remove('is-staged')
    section.style.removeProperty('--stage-h')
    next?.classList.remove('is-curtain')
  }
}

/** Scroll distance for a staged scene's animation: its sticky time, less the curtain screen if any. */
const playDistance = (section: HTMLElement, curtain: boolean) => () => `+=${Math.max(1, section.offsetHeight - innerHeight * (curtain ? 2 : 1))}`

/**
 * The homepage as one continuous, scroll-driven story.
 *
 * Runs only when <html> has the "motion" class, which the inline script in
 * index.html adds unless the visitor prefers reduced motion. Without it (or
 * without JavaScript) every scene is a complete static composition. Scrolling
 * is never taken over: staged scenes use sticky positioning and scrubbed
 * timelines. Everything is reverted on unmount and rebuilt across breakpoints.
 */
export function useHomeMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || !document.documentElement.classList.contains('motion')) return
    window.__rancoMotion = true

    let cancelled = false
    let ctx: gsap.Context | undefined
    let refresh: (() => void) | undefined

    // GSAP loads as a separate chunk after hydration, so it never delays the first render.
    const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONT_WAIT_MS))])
    const libs = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')])
    void Promise.all([libs, fontsReady])
      .then(([[{ gsap }, { ScrollTrigger }, { SplitText }]]) => {
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger, SplitText)
        ctx = gsap.context(() => {
          opening(gsap, el)
          type(gsap, ScrollTrigger, SplitText, el)
          const mm = gsap.matchMedia()
          mm.add({ desktop: DESKTOP, tabletUp: TABLET_UP, below: BELOW_DESKTOP }, (context) => {
            const { desktop, tabletUp } = context.conditions as Record<string, boolean>
            const undo: (() => void)[] = []
            undo.push(openingScroll(gsap, el, tabletUp))
            undo.push(desktop ? galleryStaged(gsap, el) : galleryFlow(gsap, el))
            undo.push(desktop ? createStaged(gsap, el) : createFlow(gsap, el))
            undo.push(desktop ? walkthrough(gsap, el) : () => {})
            undo.push(desktop ? areasStaged(gsap, el) : areasFlow(gsap, el))
            depth(gsap, el, tabletUp ? 1 : 0.5)
            reveals(gsap, el)
            return () => undo.forEach((fn) => fn())
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
      ctx?.revert()
    }
  }, [root])
}

/** Opening: the roof assembles from its planes, the headline rises, the house is lit. */
function opening(gsap: Gsap, el: HTMLElement) {
  const ease = 'power3.out'
  const header = document.querySelector('[data-header]')
  gsap.set('[data-hero-title]', { autoAlpha: 1 })
  gsap.set(el.querySelectorAll('.roofline__draw'), { strokeDasharray: 1, strokeDashoffset: 1 })
  const tl = gsap.timeline({ defaults: { ease } })
  tl.from('[data-hero-media]', { scale: 1.18, duration: 2.4, ease: 'power2.out' }, 0)
    .from('.opening__photo', { autoAlpha: 0, duration: 1.2, ease: 'power1.out' }, 0)
    .to(el.querySelectorAll('.roofline__draw'), { strokeDashoffset: 0, duration: 1.4, stagger: 0.015, ease: 'power2.inOut' }, 0.1)
  el.querySelectorAll<SVGGElement>('[data-roof-layer]').forEach((layer) => {
    const i = Number(layer.dataset.roofLayer)
    // The intro moves each layer's parts; scrolling later moves the layer itself, so the two never conflict.
    tl.from(layer.children, { autoAlpha: 0, y: (i % 2 ? -1 : 1) * (2 + i), duration: 1.3 }, 0.25 + i * 0.08)
  })
  if (header) tl.from(header, { autoAlpha: 0, y: -12, duration: 0.9 }, 0.6)
  tl.from(el.querySelectorAll('[data-hero-title] .line__inner'), { yPercent: 105, duration: 1.15, stagger: 0.1 }, 0.55).fromTo(
    '[data-hero-item]',
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 },
    1.1,
  )
}

/** Opening on scroll: the aperture opens to the whole house while the roof lifts away in depth. */
function openingScroll(gsap: Gsap, el: HTMLElement, tabletUp: boolean) {
  const section = el.querySelector<HTMLElement>('[data-scene="opening"]')
  if (!section) return () => {}
  const undo = stage(section, tabletUp ? 260 : 240, true)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: playDistance(section, true), scrub: 0.6, invalidateOnRefresh: true },
  })
  tl.to('.opening__photo', { clipPath: APERTURE_FULL, duration: 1, ease: 'power2.inOut' }, 0).fromTo('.opening__media .picture', { scale: 1 }, { scale: 1.08, duration: 1 }, 0)
  section.querySelectorAll<SVGGElement>('[data-roof-layer]').forEach((layer) => {
    const i = Number(layer.dataset.roofLayer)
    tl.to(layer, { y: -(60 + i * 40), autoAlpha: 0, duration: 0.7 }, 0.05 * i)
  })
  tl.to('.opening__copy', { y: -60, autoAlpha: 0, duration: 0.5 }, 0.35).to('.scroll-cue__line', { autoAlpha: 0, duration: 0.2 }, 0)
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
    undo()
  }
}

/** Headings rise line by line; statements light up word by word as they are read. */
function type(gsap: Gsap, ScrollTrigger: ScrollTriggerType, SplitText: SplitTextType, el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('[data-lines]').forEach((heading) => {
    gsap.set(heading, { autoAlpha: 1 })
    gsap.from(heading.querySelectorAll('.line__inner'), {
      yPercent: 105,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 86%', once: true },
    })
  })
  el.querySelectorAll<HTMLElement>('[data-sweep]').forEach((statement) => {
    const split = SplitText.create(statement.querySelectorAll('.line__inner'), { type: 'words' })
    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: statement, start: 'top 82%', end: 'bottom 50%', scrub: true } },
    )
  })
  void ScrollTrigger
}

/** Content: short, staggered rises. */
function reveals(gsap: Gsap, el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item) => {
    gsap.fromTo(
      item,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 92%', once: true } },
    )
  })
  // Horizontal image strips open from the centre as they arrive.
  el.querySelectorAll<HTMLElement>('[data-strip]').forEach((strip) => {
    gsap.fromTo(strip, { clipPath: 'inset(0% 42% 0% 42%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: strip, start: 'top bottom', end: 'center 55%', scrub: true } })
    const img = strip.querySelector('img')
    if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  // Photographs unveiled upward by a mask.
  el.querySelectorAll<HTMLElement>('[data-clip]').forEach((frame) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 82%', once: true } })
    tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
    const img = frame.querySelector('img')
    if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.1)
  })
  // Project covers open through the roof's gable.
  el.querySelectorAll<HTMLElement>('[data-gable]').forEach((frame) => {
    gsap.fromTo(
      frame,
      { clipPath: 'polygon(50% 18%, 82% 40%, 82% 100%, 18% 100%, 18% 40%)' },
      { clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)', ease: 'none', scrollTrigger: { trigger: frame, start: 'top 90%', end: 'center 50%', scrub: true } },
    )
  })
  // The materials band drifts sideways.
  el.querySelectorAll<HTMLElement>('[data-drift]').forEach((band) => {
    gsap.fromTo(band, { xPercent: 4 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
}

/** Layered photographs move at their own depth: deeper layers travel further. */
function depth(gsap: Gsap, el: HTMLElement, factor: number) {
  el.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
    const d = Number(layer.dataset.depth) * factor
    gsap.fromTo(layer, { y: () => innerHeight * 0.12 * d }, { y: () => -innerHeight * 0.12 * d, ease: 'none', scrollTrigger: { trigger: layer, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } })
  })
}

/* ── Gallery ─────────────────────────────────────────────────────────── */

const FRAME_DEPTH = [0, 1.3, 1, 0.8, 0.6, 1.5, 0.9]
const FRAME_DRIFT = [0, 1, -1, 1, -1, -1, 1]

/** Desktop: photographs drift past at different depths, then one opens to fill the screen. */
function galleryStaged(gsap: Gsap, el: HTMLElement) {
  const section = el.querySelector<HTMLElement>('[data-scene="gallery"]')
  const stageEl = section?.querySelector<HTMLElement>('.scene__stage')
  const frames = section ? gsap.utils.toArray<HTMLElement>('[data-frame]', section) : []
  if (!section || !stageEl || !frames.length) return () => {}
  const undo = stage(section, 300, true)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: playDistance(section, true), scrub: 0.8, invalidateOnRefresh: true },
  })
  const [focus, ...rest] = frames
  rest.forEach((frame) => {
    const i = Number(frame.dataset.frame)
    const d = FRAME_DEPTH[i] ?? 1
    tl.fromTo(
      frame,
      { y: () => innerHeight * 0.38 * d, x: 0 },
      { y: () => -innerHeight * 0.55 * d, x: () => FRAME_DRIFT[i] * innerWidth * 0.05 * d, duration: 1 },
      0,
    )
  })
  tl.to('[data-gallery-title]', { autoAlpha: 0, y: () => -innerHeight * 0.08, duration: 0.2 }, 0.58)
    .to(rest, { autoAlpha: 0, duration: 0.15 }, 0.66)
    .fromTo(focus, { scale: 0.86 }, { scale: 1, duration: 0.55 }, 0)
    // The focus photograph grows to fill the stage, ready for the next chapter to slide over it.
    .to(
      focus,
      {
        x: () => stageEl.clientWidth / 2 - (focus.offsetLeft + focus.offsetWidth / 2),
        y: () => stageEl.clientHeight / 2 - (focus.offsetTop + focus.offsetHeight / 2),
        scale: () => Math.max(stageEl.clientWidth / focus.offsetWidth, stageEl.clientHeight / focus.offsetHeight) * 1.02,
        duration: 0.4,
        ease: 'power2.inOut',
      },
      0.6,
    )
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
    undo()
  }
}

/** Phones and tablets: an edge-cropped collage with gentle parallax, no pinning. */
function galleryFlow(gsap: Gsap, el: HTMLElement) {
  const frames = gsap.utils.toArray<HTMLElement>('[data-frame]', el)
  const tweens = frames.map((frame) => {
    const d = FRAME_DEPTH[Number(frame.dataset.frame)] || 0.4
    return gsap.fromTo(frame, { y: () => 40 * d }, { y: () => -40 * d, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  return () => tweens.forEach((t) => (t.scrollTrigger?.kill(), t.revert()))
}

/* ── What we create ──────────────────────────────────────────────────── */

/** Desktop: the service photograph slides in from the right across the stage. */
function createStaged(gsap: Gsap, el: HTMLElement) {
  const section = el.querySelector<HTMLElement>('[data-scene="create"]')
  if (!section) return () => {}
  const undo = stage(section, 260, true)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top 60%', end: () => `top+=${Math.max(1, section.offsetHeight - innerHeight * 2)} top`, scrub: 0.6, invalidateOnRefresh: true },
  })
  tl.fromTo('[data-create-photo]', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
    .fromTo('[data-create-photo] img', { scale: 1.3, xPercent: 8 }, { scale: 1, xPercent: 0, duration: 1.4 }, 0)
    .from('[data-create-title] .line__inner', { yPercent: 105, stagger: 0.12, duration: 0.5, ease: 'power3.out' }, 0.55)
    .from('[data-create-text]', { autoAlpha: 0, y: 20, duration: 0.4 }, 0.8)
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
    undo()
  }
}

function createFlow(gsap: Gsap, el: HTMLElement) {
  const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-create-photo]', start: 'top 75%', once: true } })
  tl.fromTo('[data-create-photo]', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }).from(
    el.querySelectorAll('[data-create-title] .line__inner'),
    { yPercent: 105, stagger: 0.1, duration: 0.9, ease: 'power3.out' },
    0.6,
  )
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
  }
}

/* ── Walkthrough ─────────────────────────────────────────────────────── */

const PLATE_GAP = 1050
const PLATE_FIRST = 250

/** Desktop: a gallery hall. Plates hang on alternate walls; scrolling walks the visitor through. */
function walkthrough(gsap: Gsap, el: HTMLElement) {
  const section = el.querySelector<HTMLElement>('[data-scene="walk"]')
  const world = section?.querySelector<HTMLElement>('[data-walk-world]')
  const floor = section?.querySelector<HTMLElement>('.walk__floor')
  const counter = section?.querySelector<HTMLElement>('[data-walk-count]')
  const plates = section ? gsap.utils.toArray<HTMLElement>('[data-plate]', section) : []
  if (!section || !world || !plates.length) return () => {}
  section.classList.add('is-3d')
  const undo = stage(section, 240, false)
  const last = plates.length - 1
  const depths = plates.map((_, i) => -(PLATE_FIRST + i * PLATE_GAP + (i === last ? 400 : 0)))
  plates.forEach((plate, i) => {
    const side = i === last ? 0 : i % 2 ? 1 : -1
    gsap.set(plate, { '--x': `${side * 29}vw`, '--z': `${depths[i]}px`, '--ry': `${side * -24}deg` })
  })
  const endZ = -depths[last] - 450
  const fade = (rel: number) => {
    if (rel > 120) return 0 // passed the visitor
    if (rel > -280) return (120 - rel) / 400 // stepping past
    if (rel < -4400) return 0
    if (rel < -3000) return (rel + 4400) / 1400 // emerging from the far end
    return 1
  }
  const update = () => {
    const cam = Number(gsap.getProperty(world, 'z'))
    plates.forEach((plate, i) => {
      plate.style.opacity = String(Math.max(0, Math.min(1, fade(depths[i] + cam))))
    })
    const nearest = plates.findIndex((_, i) => depths[i] + cam < -150)
    if (counter) counter.textContent = String((nearest === -1 ? last : nearest) + 1).padStart(2, '0')
    if (floor) floor.style.backgroundPosition = `0 ${-cam}px`
  }
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: playDistance(section, false), scrub: 0.8, invalidateOnRefresh: true },
    onUpdate: update,
  })
  tl.fromTo(world, { z: 0 }, { z: endZ, duration: 1 }, 0).from('.walk__copy', { autoAlpha: 0, y: 30, duration: 0.12 }, 0.02)
  update()
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
    plates.forEach((plate) => (plate.style.opacity = ''))
    if (floor) floor.style.backgroundPosition = ''
    section.classList.remove('is-3d')
    undo()
  }
}

/* ── Where we build ──────────────────────────────────────────────────── */

/** Desktop: the route draws from district to district while the card steps through them. */
function areasStaged(gsap: Gsap, el: HTMLElement) {
  const section = el.querySelector<HTMLElement>('[data-scene="areas"]')
  const cards = section ? gsap.utils.toArray<HTMLElement>('[data-card]', section) : []
  const bars = section ? gsap.utils.toArray<HTMLElement>('[data-bar]', section) : []
  const nodes = section ? gsap.utils.toArray<SVGGElement>('[data-route-node]', section) : []
  const path = section?.querySelector('[data-route]')
  if (!section || !cards.length || !path) return () => {}
  const undo = stage(section, 200, false)
  gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 })
  gsap.set(cards.slice(1), { autoAlpha: 0, y: 24 })
  gsap.set(nodes, { autoAlpha: 0.25 })
  const n = cards.length
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: section, start: 'top top', end: playDistance(section, false), scrub: 0.6, invalidateOnRefresh: true },
  })
  tl.to(path, { strokeDashoffset: 0, duration: n - 1 }, 0.5)
  cards.forEach((card, i) => {
    tl.to(nodes[i], { autoAlpha: 1, duration: 0.2 }, Math.max(0, i - 0.1)).fromTo(bars[i], { '--p': 0 }, { '--p': 1, duration: 1 }, i)
    if (i === 0) return
    tl.to(cards[i - 1], { autoAlpha: 0, y: -24, duration: 0.25 }, i - 0.15).to(card, { autoAlpha: 1, y: 0, duration: 0.3 }, i)
  })
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
    undo()
  }
}

function areasFlow(gsap: Gsap, el: HTMLElement) {
  const path = el.querySelector('[data-route]')
  if (!path) return () => {}
  const t = gsap.fromTo(path, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: path, start: 'top 85%', end: 'bottom 50%', scrub: true } })
  return () => {
    t.scrollTrigger?.kill()
    t.revert()
  }
}
