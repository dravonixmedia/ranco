import type { Line } from '../content/home'

/**
 * A statement set line by line in uppercase serif, with an optional italic
 * accent word per line. Each line is masked so it can rise into view, and the
 * text stays a single readable sentence for assistive technology and search.
 */
export function Lines({ lines }: { lines: Line[] }) {
  return (
    <>
      {lines.map((line, i) => {
        const accent = line.accent ?? ''
        const at = accent ? line.text.indexOf(accent) : -1
        return (
          <span key={line.text} className={`line line--${i + 1}`}>
            <span className="line__inner">
              {at < 0 ? (
                line.text
              ) : (
                <>
                  {line.text.slice(0, at)}
                  <em className="acc">{accent}</em>
                  {line.text.slice(at + accent.length)}
                </>
              )}
            </span>{' '}
          </span>
        )
      })}
    </>
  )
}
