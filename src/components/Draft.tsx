import type { ReactNode } from 'react'
import { isVisible, type Status } from '../content/site'

/** Renders children only when their status is visible in this build; drafts get a preview marker. */
export function Draft({ status, children, inline = false }: { status: Status; children: ReactNode; inline?: boolean }) {
  if (!isVisible(status)) return null
  if (status === 'confirmed') return <>{children}</>
  const Tag = inline ? 'span' : 'div'
  return (
    <Tag className="draft" data-draft="">
      <span className="draft__tag">Awaiting confirmation</span>
      {children}
    </Tag>
  )
}
