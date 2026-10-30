import { getPublishedProjects } from '../media'
import { IS_PREVIEW } from './site'

export interface Chapter {
  id: string
  label: string
}

/** Projects appear only once a verified project is published (the preview always shows the layout). */
export const SHOW_PROJECTS = getPublishedProjects().length > 0 || IS_PREVIEW

/** The homepage chapters, in order. Numbering follows what this build actually shows. */
export const CHAPTERS: Chapter[] = [
  { id: 'vision', label: 'Your Vision' },
  { id: 'craft', label: 'Our Craft' },
  { id: 'services', label: 'What We Create' },
  { id: 'walkthrough', label: 'Your Home' },
  ...(SHOW_PROJECTS ? [{ id: 'projects', label: 'Our Work' }] : []),
  { id: 'areas', label: 'Where We Build' },
  { id: 'faq', label: 'Questions' },
  { id: 'contact', label: 'Begin Your Project' },
]

export const chapterNumber = (id: string) => String(CHAPTERS.findIndex((c) => c.id === id) + 1).padStart(2, '0')
