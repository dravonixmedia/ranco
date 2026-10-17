import { useCallback, useEffect, useReducer, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export interface SlideshowState {
  /** Index of the slide currently shown. */
  active: number
  /** Slides 0..mounted-1 are in the DOM (and so downloading). */
  mounted: number
  /** False until the first crossfade; the first progress bar starts full. */
  hasAdvanced: boolean
  /** Call when a slide's image has loaded and decoded. */
  markReady: (index: number) => void
}

interface State {
  count: number
  active: number
  mounted: number
  /** Slide requested by the timer but still loading. */
  pending: number | null
  ready: readonly boolean[]
  hasAdvanced: boolean
}

type Action = { type: 'mount-second' } | { type: 'tick' } | { type: 'ready'; index: number }

function show(state: State, next: number): State {
  return {
    ...state,
    active: next,
    pending: null,
    hasAdvanced: true,
    // Warm the following photo so the next crossfade is instant.
    mounted: Math.max(state.mounted, Math.min(state.count, next + 2)),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'mount-second':
      return state.mounted >= 2 ? state : { ...state, mounted: 2 }
    case 'tick': {
      const next = (state.active + 1) % state.count
      if (state.ready[next]) return show(state, next)
      return { ...state, pending: next, mounted: Math.max(state.mounted, next + 1) }
    }
    case 'ready': {
      if (state.ready[action.index]) return state
      const ready = state.ready.map((v, i) => v || i === action.index)
      const updated = { ...state, ready }
      return state.pending === action.index ? show(updated, action.index) : updated
    }
  }
}

function initialState(count: number): State {
  return {
    count,
    active: 0,
    mounted: 1,
    pending: null,
    ready: Array.from({ length: count }, (_, i) => i === 0),
    hasAdvanced: false,
  }
}

/**
 * Crossfade timing for the background photos.
 *
 * Slide 1 is in the prerendered HTML. Slide 2 is mounted after the page
 * finishes loading, and each later slide is mounted one step ahead, so
 * photos never compete with the first one. A crossfade only happens once
 * the next photo is decoded. The timer pauses while the tab is hidden, and
 * nothing moves when the visitor prefers reduced motion.
 */
export function useSlideshow(count: number, intervalMs: number): SlideshowState {
  const reducedMotion = usePrefersReducedMotion()
  const enabled = count > 1 && reducedMotion === false

  const [state, dispatch] = useReducer(reducer, count, initialState)
  const [hidden, setHidden] = useState(false)

  const markReady = useCallback((index: number) => dispatch({ type: 'ready', index }), [])

  // Start downloading slide 2 once the page itself has finished loading.
  useEffect(() => {
    if (!enabled) return
    const mountSecond = () => dispatch({ type: 'mount-second' })
    if (document.readyState === 'complete') {
      mountSecond()
      return
    }
    window.addEventListener('load', mountSecond, { once: true })
    return () => window.removeEventListener('load', mountSecond)
  }, [enabled])

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // One full interval after each crossfade (or after the tab becomes visible
  // again), move on. While a requested slide is still loading, wait for it.
  useEffect(() => {
    if (!enabled || hidden || state.pending !== null) return
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), intervalMs)
    return () => window.clearTimeout(timer)
  }, [enabled, hidden, state.pending, state.active, intervalMs])

  return { active: state.active, mounted: state.mounted, hasAdvanced: state.hasAdvanced, markReady }
}
