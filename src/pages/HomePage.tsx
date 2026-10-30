import { useRef } from 'react'
import { Draft } from '../components/Draft'
import { EnquiryForm } from '../components/EnquiryForm'
import { ArrowIcon, ArrowUpRightIcon, PhoneIcon } from '../components/Icons'
import { Picture } from '../components/Picture'
import { AREAS, CONTACT_COPY, FAQS, INTRO, PRINCIPLES, PROCESS, SERVICE_SUMMARIES, STORY } from '../content/home'
import { IS_PREVIEW, SERVICES, SITE, isVisible } from '../content/site'
import { getImage, getImagesOr, getPublishedProjects } from '../media'
import { useHomeMotion } from '../motion/useHomeMotion'

const pad = (n: number) => String(n).padStart(2, '0')

/** A small section index, e.g. "(02) Services". */
function Label({ n, children, light = false }: { n: number; children: string; light?: boolean }) {
  return (
    <p className={`label ${light ? 'label--light' : ''}`} data-reveal="">
      <span className="label__n">({pad(n)})</span> {children}
    </p>
  )
}

export function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  useHomeMotion(root)

  const services = SERVICES.filter((s) => isVisible(s.status))
  const projects = getPublishedProjects()
  // Until their own folders have photos, these slots reuse hero photographs (see MEDIA_GUIDE.md).
  const storyImages = getImagesOr('home/storytelling', 'home/hero', 1)
  const introImage = getImagesOr('home/introduction', 'home/hero', 2)[0]
  const closingImage = getImagesOr('home/closing', 'home/hero', 3)[0]

  // Section labels are numbered in the order they appear in this build, so hidden drafts leave no gaps.
  const showProjects = projects.length > 0 || IS_PREVIEW
  const sections = [
    'intro',
    'services',
    isVisible(PRINCIPLES.status) && 'principles',
    showProjects && 'projects',
    isVisible(PROCESS.status) && 'process',
    'areas',
    'faq',
    'contact',
  ].filter(Boolean)
  const n = (id: string) => sections.indexOf(id) + 1

  return (
    <div ref={root} className="home">
      <div className="grid-lines" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" data-theme="dark" aria-labelledby="hero-title">
        <div className="hero__media" data-hero-media="">
          <Picture image={getImage('home/hero')} folder="home/hero" sizes="100vw" priority cover />
        </div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="container hero__frame">
          <p className="hero__index" data-hero-item="">
            <span>Kerala</span>
            <span aria-hidden="true" className="hero__rule" />
            <span>{SITE.districts.join(' · ')}</span>
          </p>
          <h1 id="hero-title" className="hero__title" data-lines="">
            <span className="line">
              <span>Build Your</span>
            </span>{' '}
            <span className="line line--indent">
              <span>Dream Home</span>
            </span>{' '}
            <span className="line">
              <span>
                <em>With Us.</em>
              </span>
            </span>
          </h1>
          <div className="hero__foot">
            <p className="hero__statement" data-hero-item="">
              {SITE.statement}
            </p>
            <div className="hero__actions" data-hero-item="">
              <a className="btn btn--gold" href="#contact">
                Discuss Your Project <ArrowIcon />
              </a>
              <a className="text-link text-link--light" href={SITE.phone.tel}>
                <PhoneIcon /> {SITE.phone.display}
              </a>
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#intro" data-hero-item="" aria-label="Scroll to introduction">
          <span className="scroll-cue__line" aria-hidden="true" />
        </a>
      </section>

      {/* ── Introduction ─────────────────────────────────────── */}
      <section id="intro" className="section intro" data-tone="ivory" data-theme="light" aria-labelledby="intro-title">
        <div className="container intro__grid">
          <Label n={n('intro')}>RANCO</Label>
          <h2 id="intro-title" className="statement intro__statement" data-lines="">
            Homes shaped around the <em>families</em> who live in them.
          </h2>
          <figure className="intro__figure" data-clip="">
            <Picture image={introImage} folder="home/introduction" sizes="(min-width: 1024px) 38vw, 100vw" decorative />
          </figure>
          <div className="intro__copy">
            {INTRO.paragraphs.map((p) => (
              <Draft key={p.text} status={p.status}>
                <p className="body-lg" data-reveal="">
                  {p.text}
                </p>
              </Draft>
            ))}
            <a className="text-link" href="#services" data-reveal="">
              What we do <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section id="services" className="section services" data-tone="stone" data-theme="light" aria-labelledby="services-title">
        <div className="container">
          <div className="section-head section-head--split">
            <Label n={n('services')}>Services</Label>
            <h2 id="services-title" className="heading" data-lines="">
              {services.length > 1 ? 'Construction and renovation, done with care.' : 'Home renovation, done with care.'}
            </h2>
          </div>
          <ol className="svc">
            {services.map((s, i) => (
              <li key={s.slug} className="svc__item" data-reveal="">
                <Draft status={s.status}>
                  <div className="svc__row">
                    <span className="svc__n">{pad(i + 1)}</span>
                    <h3 className="svc__title">{s.title}</h3>
                    <p className="svc__text">{SERVICE_SUMMARIES[s.slug]}</p>
                    <span className="svc__arrow" aria-hidden="true">
                      <ArrowUpRightIcon />
                    </span>
                    <div className="svc__media" aria-hidden="true">
                      <Picture image={getImage(`services/${s.slug}`)} folder={`services/${s.slug}`} sizes="22vw" cover decorative optional />
                    </div>
                  </div>
                </Draft>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why RANCO ────────────────────────────────────────── */}
      <Draft status={PRINCIPLES.status}>
        <section className="section principles" data-tone="charcoal" data-theme="dark" aria-labelledby="principles-title">
          <div className="container">
            <div className="section-head">
              <Label n={n('principles')} light>
                Why RANCO
              </Label>
              <h2 id="principles-title" className="heading" data-lines="">
                {PRINCIPLES.heading}
              </h2>
            </div>
            <ol className="principles__list">
              {PRINCIPLES.items.map((item, i) => (
                <li key={item.title} className="principle" data-reveal="">
                  <span className="principle__n">{pad(i + 1)}</span>
                  <h3 className="principle__title">{item.title}</h3>
                  <p className="principle__text">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Draft>

      {/* ── Projects (published, verified projects only) ─────── */}
      {showProjects && (
        <section id="projects" className="section projects" data-tone="ivory" data-theme="light" aria-labelledby="projects-title">
          <div className="container">
            <div className="section-head section-head--split">
              <Label n={n('projects')}>Projects</Label>
              <h2 id="projects-title" className="heading" data-lines="">
                Selected work
              </h2>
            </div>
            {projects.length > 0 ? (
              <ul className="portfolio">
                {projects.slice(0, 4).map((p) => (
                  <li key={p.slug} className="portfolio__item" data-reveal="">
                    <figure data-clip="">
                      <Picture image={getImage(`projects/${p.slug}/cover`)} folder={`projects/${p.slug}/cover`} sizes="(min-width: 768px) 50vw, 100vw" />
                    </figure>
                    <p className="portfolio__meta">
                      {p.category} <span aria-hidden="true">—</span> {p.district}
                    </p>
                    <h3 className="portfolio__title">{p.title}</h3>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state" data-reveal="">
                <p className="empty-state__title">Verified RANCO projects will appear here.</p>
                <p>
                  Add a folder under <code>media/projects/</code> with photographs and a completed <code>project.json</code>, then
                  set <code>"published": true</code>. See MEDIA_GUIDE.md.
                </p>
                <p className="empty-state__note">Preview only: production hides this section until a project is published.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Your Vision. Our Craft. Your Home. ──────────────── */}
      <section id="story" className="story" data-theme="dark" data-story="" aria-label="Your Vision. Our Craft. Your Home.">
        {STORY.map((s, i) => (
          <div key={s.word} className="story__panel" data-story-panel="">
            <div className="story__media" data-story-media="">
              <Picture image={storyImages[i]} folder="home/storytelling" sizes="100vw" cover decorative />
            </div>
            <div className="story__shade" aria-hidden="true" />
            <div className="container story__content">
              <p className="story__n" aria-hidden="true">
                {pad(i + 1)}
              </p>
              <h2 className="story__word">
                <span>{s.word}</span>
              </h2>
              <p className="story__text">{s.text}</p>
            </div>
          </div>
        ))}
        <ol className="story__rail" aria-hidden="true">
          {STORY.map((s) => (
            <li key={s.word} data-story-tick="" />
          ))}
        </ol>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <Draft status={PROCESS.status}>
        <section id="process" className="section process" data-tone="ivory" data-theme="light" aria-labelledby="process-title">
          <div className="container process__grid">
            <div className="process__head">
              <Label n={n('process')}>Process</Label>
              <h2 id="process-title" className="heading" data-lines="">
                {PROCESS.heading}
              </h2>
            </div>
            <ol className="steps" data-steps="">
              <span className="steps__line" aria-hidden="true">
                <span className="steps__progress" data-steps-progress="" />
              </span>
              {PROCESS.steps.map((step, i) => (
                <li key={step.title} className="step" data-reveal="">
                  <span className="step__n">{pad(i + 1)}</span>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Draft>

      {/* ── Service areas ────────────────────────────────────── */}
      <section id="areas" className="section areas" data-tone="stone" data-theme="light" aria-labelledby="areas-title">
        <div className="container">
          <div className="section-head section-head--split">
            <Label n={n('areas')}>Service areas</Label>
            <h2 id="areas-title" className="heading" data-lines="">
              Central Travancore and surrounding districts
            </h2>
          </div>
          <ol className="areas__index">
            {AREAS.map((a, i) => (
              <li key={a.district} className="area" data-reveal="">
                <span className="area__n">{pad(i + 1)}</span>
                <h3 className="area__name">{a.district}</h3>
                <p className="area__text">{a.text}</p>
                <div className="area__media" aria-hidden="true">
                  <Picture image={getImage(`service-areas/${a.district.toLowerCase()}`)} folder={`service-areas/${a.district.toLowerCase()}`} sizes="20vw" cover decorative optional />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="section faq" data-tone="ivory" data-theme="light" aria-labelledby="faq-title">
        <div className="container faq__grid">
          <div className="faq__head">
            <Label n={n('faq')}>Questions</Label>
            <h2 id="faq-title" className="heading" data-lines="">
              Frequently asked questions
            </h2>
          </div>
          <div className="faq__list">
            {FAQS.map((f) => (
              <Draft key={f.question} status={f.status}>
                <details className="faq__item" data-reveal="">
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

      {/* ── Closing ──────────────────────────────────────────── */}
      <section id="contact" className="closing" data-theme="dark" aria-labelledby="contact-title">
        <div className="closing__stage">
          <div className="closing__media" data-closing-media="">
            <Picture image={closingImage} folder="home/closing" sizes="100vw" cover decorative />
          </div>
          <div className="closing__shade" aria-hidden="true" />
          <div className="container closing__inner">
            <Label n={n('contact')} light>
              Get in touch
            </Label>
            <h2 id="contact-title" className="closing__title" data-lines="">
              {CONTACT_COPY.heading}
            </h2>
            <p className="closing__lede" data-reveal="">
              {CONTACT_COPY.text}
            </p>
            <div className="closing__actions" data-reveal="">
              <a className="btn btn--gold btn--large" href={SITE.phone.tel}>
                <PhoneIcon /> Call {SITE.phone.display}
              </a>
              <a className="btn btn--outline-light btn--large" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp <ArrowUpRightIcon />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
        <div className="container closing__form">
          <div className="closing__form-head" data-reveal="">
            <h3>Prefer to write?</h3>
            <p>Share a few details and continue the conversation on WhatsApp.</p>
          </div>
          <div data-reveal="">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  )
}
