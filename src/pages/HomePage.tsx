import { useRef, type CSSProperties } from 'react'
import { Draft } from '../components/Draft'
import { EnquiryForm } from '../components/EnquiryForm'
import { ArrowIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons'
import { Picture } from '../components/Picture'
import { ABOUT, AREAS, AREAS_INTRO, AREAS_TITLE, CONTACT_COPY, EXPERTISE, FAQS, JOURNEY } from '../content/home'
import { SHOW_PROJECTS } from '../content/nav'
import { IS_PREVIEW, SERVICES, SITE } from '../content/site'
import { getImage, getImages, getImagesOr, getPublishedProjects } from '../media'
import { useReveal } from '../motion/useReveal'
import { useScrollProgress } from '../motion/useScrollProgress'

const pad = (n: number) => String(n).padStart(2, '0')

export function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  useScrollProgress(root)

  const heroPhotos = getImages('home/hero')
  const hero = heroPhotos[0]
  // Until their own folders have photos, these slots reuse hero photographs (see MEDIA_GUIDE.md).
  const aboutImage = getImagesOr('home/about', 'home/hero', 2)[0]
  const closingImage = getImagesOr('home/closing', 'home/hero')[0]
  const journeyImages = getImages('home/journey')
  const [construction, heritage] = SERVICES
  const serviceImages = {
    [construction.slug]: getImagesOr(`services/${construction.slug}`, 'home/hero', 1),
    [heritage.slug]: getImagesOr(`services/${heritage.slug}`, 'home/hero', 3),
  }
  const projects = getPublishedProjects()

  return (
    <div ref={root} className="home">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" data-theme="dark" data-scroll="exit" aria-labelledby="hero-title">
        <div className="hero__media">
          <Picture image={hero} folder="home/hero" sizes="100vw" priority cover />
        </div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="container hero__inner">
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">From Your First Idea</span>{' '}
            <span className="hero__line">
              to Your <em className="hero__accent">Dream Home.</em>
            </span>
          </h1>
          <p className="hero__lede">{SITE.positioning}</p>
          <div className="hero__actions">
            <a className="btn btn--gold" href="#contact">
              Discuss Your Project <ArrowIcon />
            </a>
            <a className="btn btn--outline-light" href={SITE.phone.tel}>
              <PhoneIcon /> Call RANCO
            </a>
          </div>
        </div>
        <p className="container hero__statement">{SITE.districts.join(' · ')}</p>
      </section>

      {/* ── About RANCO ─────────────────────────────────────── */}
      <section id="about" className="section about" data-theme="light" data-scroll="enter" aria-labelledby="about-title">
        <div className="container about__grid">
          <div className="about__text">
            <p className="eyebrow">About RANCO</p>
            <h2 id="about-title" className="about__statement" data-reveal="">
              {ABOUT.title}
            </h2>
            <p className="about__lead">{ABOUT.text}</p>
            <div className="about__copy">
              {ABOUT.message.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <figure className="about__figure" data-scroll="enter">
            <Picture image={aboutImage} folder="home/about" sizes="(min-width: 1024px) 42vw, 100vw" decorative />
          </figure>
        </div>
      </section>

      {/* ── From idea to handover ───────────────────────────── */}
      <section id="journey" className="section journey" data-theme="dark" aria-labelledby="journey-title">
        <div className="container">
          <div className="journey__head">
            <p className="eyebrow">From Idea to Handover</p>
            <h2 id="journey-title" className="journey__title" data-reveal="">
              {JOURNEY.title}
            </h2>
            <p className="journey__intro">{JOURNEY.text}</p>
          </div>
          <div className="stages">
            <span className="stages__line" data-scroll="cover" aria-hidden="true">
              <span className="stages__progress" />
            </span>
            <ol className={`stages__list ${journeyImages.length || IS_PREVIEW ? 'stages__list--photos' : ''}`}>
            {JOURNEY.stages.map((stage, i) => {
              const image = journeyImages[i]
              return (
                <li key={stage.title} className={`stage ${i % 2 ? 'stage--right' : 'stage--left'}`} style={{ '--i': i } as CSSProperties}>
                  <span className="stage__dot" aria-hidden="true" />
                  <div className="stage__body" data-reveal="">
                    {(image || IS_PREVIEW) && (
                      <figure className="stage__figure">
                        <Picture image={image} folder="home/journey" sizes="(min-width: 1024px) 34vw, 90vw" placeholder={`Placeholder · stage ${pad(i + 1)} photo for media/home/journey/`} />
                      </figure>
                    )}
                    <p className="stage__n">{pad(i + 1)}</p>
                    <h3 className="stage__title">{stage.title}</h3>
                    <p className="stage__text">{stage.text}</p>
                    {stage.note && (
                      <Draft status="draft">
                        <p className="stage__note">{stage.note}</p>
                      </Draft>
                    )}
                  </div>
                </li>
              )
            })}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Our expertise: two signature services ───────────── */}
      <section id="expertise" className="expertise" aria-labelledby="expertise-title">
        <div className="section expertise__construction" data-theme="light">
          <div className="container">
            <div className="expertise__head">
              <p className="eyebrow">Our Expertise</p>
              <h2 id="expertise-title" className="section-title" data-reveal="">
                {EXPERTISE.title}
              </h2>
            </div>
            <article className="signature signature--construction" aria-labelledby="service-construction">
              <figure className="signature__figure" data-scroll="enter">
                <Picture image={serviceImages[construction.slug][0]} folder={`services/${construction.slug}`} sizes="(min-width: 1024px) 58vw, 100vw" decorative />
              </figure>
              <div className="signature__text">
                <p className="signature__n">01 · {construction.title}</p>
                <h3 id="service-construction" className="signature__headline" data-reveal="">
                  {EXPERTISE.services[construction.slug].headline}
                </h3>
                <p className="signature__body">{EXPERTISE.services[construction.slug].text}</p>
                <a className="text-link" href="#contact">
                  Plan your new home <ArrowIcon />
                </a>
              </div>
            </article>
          </div>
        </div>
        <div className="section expertise__heritage" data-theme="light" data-scroll="enter">
          <div className="container">
            <article className="signature signature--heritage" aria-labelledby="service-heritage">
              <div className="signature__text">
                <p className="signature__n">02 · {heritage.title}</p>
                <h3 id="service-heritage" className="signature__headline" data-reveal="">
                  {EXPERTISE.services[heritage.slug].headline}
                </h3>
                <p className="signature__body">{EXPERTISE.services[heritage.slug].text}</p>
                <a className="text-link" href="#contact">
                  Talk about your traditional home <ArrowIcon />
                </a>
              </div>
              <figure className="signature__figure" data-scroll="enter">
                <Picture image={serviceImages[heritage.slug][0]} folder={`services/${heritage.slug}`} sizes="(min-width: 1024px) 40vw, 100vw" decorative />
              </figure>
            </article>
          </div>
        </div>
      </section>

      {/* ── Our work (verified, published projects only) ─────── */}
      {SHOW_PROJECTS && (
        <section id="work" className="section work" data-theme="light" aria-labelledby="work-title">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Our Work</p>
              <h2 id="work-title" className="section-title" data-reveal="">
                Homes we have built and renewed
              </h2>
            </div>
            {SERVICES.map((service) => {
              const items = projects.filter((p) => p.category === service.title)
              if (!items.length && !IS_PREVIEW) return null
              return (
                <div key={service.slug} className="work__group">
                  <h3 className="work__category">{service.title}</h3>
                  {items.length > 0 ? (
                    <ul className="portfolio">
                      {items.slice(0, 4).map((p) => (
                        <li key={p.slug} className="portfolio__item" data-reveal="">
                          <figure data-scroll="cover">
                            <Picture image={getImage(`projects/${p.slug}/cover`)} folder={`projects/${p.slug}/cover`} sizes="(min-width: 768px) 50vw, 100vw" />
                          </figure>
                          <p className="portfolio__meta">{p.district}</p>
                          <h4 className="portfolio__title">{p.title}</h4>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">
                      <p className="empty-state__title">Verified {service.title} projects will appear here.</p>
                      <p>
                        Add a folder under <code>media/projects/</code> with photographs and a completed <code>project.json</code> (category{' '}
                        <code>"{service.title}"</code>), then set <code>"published": true</code>. See MEDIA_GUIDE.md.
                      </p>
                      <p className="empty-state__note">Preview only: production shows this category once a project is published.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Where we work ───────────────────────────────────── */}
      <section id="areas" className="section areas" data-theme="dark" data-scroll="enter" aria-labelledby="areas-title">
        <div className="container">
          <div className="areas__head">
            <p className="eyebrow">Where We Work</p>
            <h2 id="areas-title" className="section-title" data-reveal="">
              {AREAS_TITLE}
            </h2>
            <p className="areas__intro">{AREAS_INTRO}</p>
          </div>
          <ul className="districts" data-scroll="enter">
            {AREAS.map((a, i) => (
              <li key={a.district} className="district" style={{ '--i': i } as CSSProperties}>
                <h3 className="district__name">{a.district}</h3>
                <p className="district__text">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="section faq" data-theme="light" aria-labelledby="faq-title">
        <div className="container faq__grid">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 id="faq-title" className="section-title">
              Frequently asked
            </h2>
          </div>
          <div className="faq__list">
            {FAQS.map((f) => (
              <Draft key={f.question} status={f.status}>
                <details className="faq__item">
                  <summary>
                    <h3>{f.question}</h3>
                    <span className="faq__icon" aria-hidden="true" />
                  </summary>
                  <p>{f.answer}</p>
                </details>
              </Draft>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / start your project ────────────────────── */}
      <section id="contact" className="contact" data-theme="dark" aria-labelledby="contact-title">
        <div className="contact__banner" data-scroll="enter">
          <Picture image={closingImage} folder="home/closing" sizes="100vw" cover decorative />
          <div className="contact__shade" aria-hidden="true" />
          <div className="container contact__head">
            <p className="eyebrow eyebrow--light">Start Your Project</p>
            <h2 id="contact-title" className="contact__title" data-reveal="">
              {CONTACT_COPY.heading}
            </h2>
            <p className="contact__lede">{CONTACT_COPY.text}</p>
          </div>
        </div>
        <div className="container contact__grid">
          <div className="contact__direct">
            <a className="contact-card" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              <span className="contact-card__label">WhatsApp</span>
              <span className="contact-card__value">Send a message</span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <a className="contact-card" href={SITE.phone.tel}>
              <PhoneIcon />
              <span className="contact-card__label">Call</span>
              <span className="contact-card__value">{SITE.phone.display}</span>
            </a>
            <p className="contact__areas">Serving homeowners in {SITE.districts.join(', ')}</p>
          </div>
          <div className="contact__form">
            <h3>Prefer to write?</h3>
            <p>Share a few details and continue the conversation on WhatsApp.</p>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  )
}
