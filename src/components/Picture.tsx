import type { CSSProperties } from 'react'
import { IS_PREVIEW } from '../content/site'
import type { MediaImage } from '../media'

interface Props {
  image: MediaImage | undefined
  /** media/ folder the image comes from, shown on the preview placeholder. */
  folder: string
  sizes: string
  className?: string
  /** Above-the-fold image: load eagerly with high priority. */
  priority?: boolean
  /** Fill the parent and crop (object-fit: cover) instead of keeping the photo's own aspect ratio. */
  cover?: boolean
  /** Force empty alt for a purely decorative use of an informative photo. */
  decorative?: boolean
  /** Content image that production simply omits until a photo is uploaded (preview still shows the placeholder). */
  optional?: boolean
  /** Preview label for an empty slot, replacing the default "add a photo to …" hint. */
  placeholder?: string
}

/**
 * A photograph from the media manifest, or a quiet architectural placeholder
 * when the folder has no image yet. Placeholders are labelled only in preview builds.
 */
export function Picture({ image, folder, sizes, className = '', priority = false, cover = false, decorative = false, optional = false, placeholder }: Props) {
  if (!image) {
    if (optional && !IS_PREVIEW) return null
    return (
      <div className={`picture picture--empty ${cover ? 'picture--cover' : ''} ${className}`} aria-hidden="true">
        {IS_PREVIEW && (
          <span className="picture__label">
            {placeholder ?? (
              <>
                Placeholder · add a photo to <code>media/{folder}/</code>
              </>
            )}
          </span>
        )}
      </div>
    )
  }
  const style = { '--ratio': `${image.width} / ${image.height}`, backgroundColor: image.color } as CSSProperties
  return (
    <div className={`picture ${cover ? 'picture--cover' : ''} ${className}`} style={style}>
      <img
        src={image.src}
        srcSet={image.srcset}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={decorative ? '' : image.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  )
}
