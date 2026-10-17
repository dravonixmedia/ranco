import type { Slide } from '../content'

interface Props {
  slides: readonly Slide[]
  active: number
  mounted: number
  onReady: (index: number) => void
}

export function BackgroundSlideshow({ slides, active, mounted, onReady }: Props) {
  return (
    <div className="slides" aria-hidden="true">
      {slides.slice(0, mounted).map((slide, i) => (
        <figure key={slide.jpg} className={i === active ? 'slide is-active' : 'slide'}>
          <picture>
            <source type="image/webp" srcSet={slide.webp} sizes="100vw" />
            <img
              src={slide.jpg}
              width={slide.width}
              height={slide.height}
              alt=""
              decoding="async"
              fetchPriority={i === 0 ? 'high' : undefined}
              ref={(img) => {
                // Already loaded (e.g. from cache) before React attached onLoad.
                if (img?.complete && img.naturalWidth > 0) onReady(i)
              }}
              onLoad={(e) => {
                const img = e.currentTarget
                void img.decode().catch(() => undefined).then(() => onReady(i))
              }}
            />
          </picture>
        </figure>
      ))}
    </div>
  )
}
