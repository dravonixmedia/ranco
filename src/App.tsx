import { BackgroundSlideshow } from './components/BackgroundSlideshow'
import { MaintenanceContent } from './components/MaintenanceContent'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { SLIDE_INTERVAL_MS, SLIDES } from './content'
import { useSlideshow } from './hooks/useSlideshow'

export function App() {
  const { active, mounted, hasAdvanced, markReady } = useSlideshow(SLIDES.length, SLIDE_INTERVAL_MS)

  return (
    <div className="page">
      <BackgroundSlideshow slides={SLIDES} active={active} mounted={mounted} onReady={markReady} />
      <div className="veil" aria-hidden="true" />
      <SiteHeader />
      <MaintenanceContent />
      <SiteFooter slideCount={SLIDES.length} active={active} hasAdvanced={hasAdvanced} intervalMs={SLIDE_INTERVAL_MS} />
    </div>
  )
}
