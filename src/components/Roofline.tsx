/**
 * RANCO's opening sculpture: a Kerala roof, built from layered planes rather
 * than a single line. The gable (with its timber screen), the barge boards,
 * a lower eave tier and the plinth are separate layers, so the opening can
 * assemble them and later lift them apart in depth.
 *
 * Coordinates are percentages of the opening scene. The same geometry gives
 * the photograph's aperture (`aperturePolygon`), so the roof always sits
 * exactly on the opening it frames.
 */

export interface RoofGeometry {
  cx: number // ridge line (horizontal centre of the house)
  apex: number // gable apex height
  eave: number // where the gable meets the walls
  left: number // aperture walls
  right: number
  base: number // plinth line
}

// On large screens the house stands right of centre, leaving the headline its own space on the left.
export const ROOF_DESKTOP: RoofGeometry = { cx: 61, apex: 14, eave: 37, left: 47, right: 75, base: 86 }
export const ROOF_MOBILE: RoofGeometry = { cx: 50, apex: 23, eave: 41, left: 12, right: 88, base: 84 }

const pt = (x: number, y: number) => `${x.toFixed(2)}% ${y.toFixed(2)}%`

/** clip-path polygon for the photograph: a house silhouette under the roof. */
export const aperturePolygon = (g: RoofGeometry) =>
  `polygon(${pt(g.cx, g.apex)}, ${pt(g.right, g.eave)}, ${pt(g.right, g.base)}, ${pt(g.left, g.base)}, ${pt(g.left, g.eave)})`

/** The same five points stretched to the full frame, for the aperture to open into. */
export const APERTURE_FULL = `polygon(${pt(50, 0)}, ${pt(100, 0)}, ${pt(100, 100)}, ${pt(0, 100)}, ${pt(0, 0)})`

const poly = (points: [number, number][]) => points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')

export function Roofline({ geometry: g, variant }: { geometry: RoofGeometry; variant: 'desktop' | 'mobile' }) {
  const id = (name: string) => `roof-${variant}-${name}`
  const c = g.cx
  const half = c - g.left
  const slopeY = (x: number) => g.apex + (Math.abs(x - c) / half) * (g.eave - g.apex)
  // Construction lines continue the roof pitch to the edges of the frame.
  const edgeY = (x: number) => slopeY(x)
  const overhang = Math.min(7, g.left - 1)
  const tier = Math.min(10, g.left)
  const slats = Array.from({ length: 13 }, (_, i) => g.left + 2.2 + (i * (g.right - g.left - 4.4)) / 12)

  return (
    <svg className={`roofline roofline--${variant}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id('slab')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1e3c4" />
          <stop offset="0.55" stopColor="#c9ab72" />
          <stop offset="1" stopColor="#7d6031" />
        </linearGradient>
        <linearGradient id={id('ghost')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c7a5" stopOpacity="0.16" />
          <stop offset="1" stopColor="#d9c7a5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('tier')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c7a5" stopOpacity="0.75" />
          <stop offset="1" stopColor="#7d6031" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Construction lines: the roof pitch and datum lines, drawn first. */}
      <g className="roofline__layer" data-roof-layer="0">
        <line className="roofline__draw roofline__hair" pathLength={1} x1={c} y1={g.apex} x2="0" y2={edgeY(0)} />
        <line className="roofline__draw roofline__hair" pathLength={1} x1={c} y1={g.apex} x2="100" y2={edgeY(100)} />
        <line className="roofline__draw roofline__hair" pathLength={1} x1="0" y1={g.base} x2="100" y2={g.base} />
      </g>

      {/* A ghosted rear roof, set back and above. */}
      <g className="roofline__layer" data-roof-layer="1">
        <polygon points={poly([[c, g.apex - 6], [g.right + overhang + 6, g.eave + 2], [g.left - overhang - 6, g.eave + 2]])} fill={`url(#${id('ghost')})`} />
      </g>

      {/* Gable: tie beam, king post and the timber screen. */}
      <g className="roofline__layer" data-roof-layer="2">
        {slats.map((x) => (
          <line key={x} className="roofline__draw roofline__slat" pathLength={1} x1={x} y1={slopeY(x) + 1.4} x2={x} y2={g.eave - 0.6} />
        ))}
        <line className="roofline__draw roofline__beam" pathLength={1} x1={g.left} y1={g.eave} x2={g.right} y2={g.eave} />
        <line className="roofline__draw roofline__beam" pathLength={1} x1={c} y1={g.apex + 2} x2={c} y2={g.eave} />
      </g>

      {/* Barge boards: the two solid planes of the roof. */}
      <g className="roofline__layer" data-roof-layer="3">
        <polygon className="roofline__slab" points={poly([[c, g.apex], [g.left - overhang, g.eave + 4.4], [g.left - overhang, g.eave + 6.6], [c, g.apex + 2.8]])} fill={`url(#${id('slab')})`} />
        <polygon className="roofline__slab" points={poly([[c, g.apex], [g.right + overhang, g.eave + 4.4], [g.right + overhang, g.eave + 6.6], [c, g.apex + 2.8]])} fill={`url(#${id('slab')})`} />
        <line className="roofline__draw roofline__edge" pathLength={1} x1={c} y1={g.apex} x2={g.left - overhang} y2={g.eave + 4.4} />
        <line className="roofline__draw roofline__edge" pathLength={1} x1={c} y1={g.apex} x2={g.right + overhang} y2={g.eave + 4.4} />
        {/* Finial */}
        <line className="roofline__draw roofline__edge" pathLength={1} x1={c} y1={g.apex} x2={c} y2={g.apex - 4.5} />
        <polygon points={poly([[c, g.apex - 6.4], [c + 0.5, g.apex - 5.2], [c, g.apex - 4], [c - 0.5, g.apex - 5.2]])} fill="#e9d9b6" />
      </g>

      {/* The lower eave tier, crossing in front like a verandah roof. */}
      <g className="roofline__layer" data-roof-layer="4">
        <polygon points={poly([[g.left - tier + 2, g.eave + 9], [g.right + tier - 2, g.eave + 9], [g.right + tier + 1, g.eave + 11.2], [g.left - tier - 1, g.eave + 11.2]])} fill={`url(#${id('tier')})`} />
      </g>

      {/* Pillars and plinth. */}
      <g className="roofline__layer" data-roof-layer="5">
        <line className="roofline__draw roofline__pillar" pathLength={1} x1={g.left} y1={g.eave + 11.2} x2={g.left} y2={g.base} />
        <line className="roofline__draw roofline__pillar" pathLength={1} x1={g.right} y1={g.eave + 11.2} x2={g.right} y2={g.base} />
        <polygon points={poly([[g.left - 3, g.base], [g.right + 3, g.base], [g.right + 5, g.base + 1.8], [g.left - 5, g.base + 1.8]])} fill={`url(#${id('slab')})`} opacity="0.7" />
      </g>
    </svg>
  )
}
