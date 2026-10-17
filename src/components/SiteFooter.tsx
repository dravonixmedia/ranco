import type { CSSProperties } from 'react'

interface Props {
  slideCount: number
  active: number
  hasAdvanced: boolean
  intervalMs: number
}

export function SiteFooter({ slideCount, active, hasAdvanced, intervalMs }: Props) {
  const counterStyle = { '--slide-ms': `${intervalMs}ms` } as CSSProperties

  return (
    <footer className="bottom">
      <p>© 2026 RANCO. All Rights Reserved.</p>
      <div className="footer-meta">
        <div className="counter" aria-hidden="true" style={counterStyle}>
          {Array.from({ length: slideCount }, (_, i) => (
            <span key={i} className={barClass(i, active, hasAdvanced)} />
          ))}
        </div>
        <a href="https://ranco.in/">ranco.in</a>
      </div>
    </footer>
  )
}

function barClass(i: number, active: number, hasAdvanced: boolean): string | undefined {
  if (i === active) return hasAdvanced ? 'is-active' : 'is-active is-initial'
  if (i < active) return 'is-done'
  return undefined
}
