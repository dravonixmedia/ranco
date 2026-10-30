import { useEffect, useState } from 'react'
import { CHAPTERS, chapterNumber } from '../content/chapters'

/**
 * A quiet orientation aid on large screens: the current chapter and how far
 * through the story the visitor is. Purely visual; the chapter headings and
 * the menu carry the same information for assistive technology.
 */
export function ChapterMarker() {
  const [current, setCurrent] = useState<string | null>(null)
  const [theme, setTheme] = useState('dark')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = innerHeight * 0.85
      let chapter: string | null = null
      let tone = 'dark'
      for (const el of document.elementsFromPoint(48, y)) {
        if (el.closest('.chapter-marker')) continue
        const themed = el.closest<HTMLElement>('[data-theme]')
        if (themed && tone === 'dark' && !chapter) tone = themed.dataset.theme ?? 'dark'
        const owner = el.closest<HTMLElement>('[data-chapter]')
        if (owner) {
          chapter = owner.dataset.chapter ?? null
          break
        }
        if (themed) break
      }
      setCurrent(chapter)
      setTheme(tone)
      const max = document.documentElement.scrollHeight - innerHeight
      setProgress(max > 0 ? scrollY / max : 0)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const chapter = CHAPTERS.find((c) => c.id === current)
  return (
    <div className={`chapter-marker ${chapter ? 'is-visible' : ''} chapter-marker--${theme}`} aria-hidden="true">
      <span className="chapter-marker__n">{chapter ? chapterNumber(chapter.id) : ''}</span>
      <span className="chapter-marker__rail">
        <span style={{ transform: `scaleX(${progress})` }} />
      </span>
      <span className="chapter-marker__label">{chapter?.label}</span>
    </div>
  )
}
