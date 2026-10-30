import { useRef } from 'react'
import { Draft } from '../components/Draft'
import { EnquiryForm } from '../components/EnquiryForm'
import { ArrowIcon, ArrowUpRightIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons'
import { Picture } from '../components/Picture'
import { AREAS, CONTACT_COPY, FAQS, INTRO, PRINCIPLES, PROCESS, SERVICE_SUMMARIES, STORY } from '../content/home'
import { IS_PREVIEW, SERVICES, SITE, isVisible } from '../content/site'
import { getImage, getImages, getPublishedProjects } from '../media'
import { useHomeMotion } from '../motion/useHomeMotion'

export function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  useHomeMotion(root)

  const services = SERVICES.filter((s) => isVisible(s.status))
  const projects = getPublishedProjects()
  const storyImages = getImages('home/storytelling')
  const introImage = getImage('home/introduction')

  return (
    <div ref={root}>
      <section className="hero" data-theme="dark" aria-labelledby="hero-title">
        <div className="hero__media" data-hero-media="">
          <Picture image={getImage('home/hero')} folder="home/hero" sizes="100vw" priority cover />
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hero__content">
          <h1 id="hero-title" className="hero__title display" data-lines="">
            <span className="line">
              <span>Build Your Dream</span>
            </span>{' '}
            <span className="line">
              <span>Home With Us.</span>
            </span>
          </h1>
          <p className="hero__statement" data-hero-item="">
            {SITE.statement}
          </p>
          <div className="hero__actions" data-hero-item="">
            <a className="btn btn--gold" href="#contact">
              Discuss Your Project <ArrowIcon />
            </a>
            <a className="btn btn--outline-light" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <a className="text-link text-link--light" href={SITE.phone.tel}>
              <PhoneIcon /> {SITE.phone.display}
            </a>
          </div>
        </div>
        <a className="scroll-cue" href="#intro" data-hero-item="">
          <span>Scroll</span>
          <span className="scroll-cue__line" aria-hidden="true" />
        </a>
      </section>

      <section id="intro" className="section section--ivory intro" data-theme="light" aria-labelledby="intro-title">
        <div className={`container intro__grid ${introImage || IS_PREVIEW ? '' : 'intro__grid--single'}`}>
          <div className="intro__text">
            <p className="eyebrow" data-reveal="">
              {INTRO.eyebrow}
            </p>
            <h2 id="intro-title" className="display display--lg" data-lines="">
              {INTRO.heading}
            </h2>
            {INTRO.paragraphs.map((p) => (
              <Draft key={p.text} status={p.status}>
                <p className="lede" data-reveal="">
                  {p.text}
                </p>
              </Draft>
            ))}
          </div>
          {(introImage || IS_PREVIEW) && (
            <div className="intro__media" data-parallax="">
              <Picture image={introImage} folder="home/introduction" sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          )}
        </div>
      </section>

      <section id="services" className="section section--stone services" data-theme="light" aria-labelledby="services-title">
        <div className="container">
          <header className="section-head">
            <p className="eyebrow" data-reveal="">
              What we do
            </p>
            <h2 id="services-title" className="display display--lg" data-lines="">
              {services.length > 1 ? 'Home construction and renovation services' : 'Home renovation in Kerala'}
            </h2>
          </header>
          <ol className="service-list">
            {services.map((s, i) => (
              <li key={s.slug} className="service-row" data-reveal="">
                <Draft status={s.status}>
                  <div className="service-row__inner">
                    <span className="service-row__index">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="service-row__title">{s.title}</h3>
                    <p className="service-row__text">{SERVICE_SUMMARIES[s.slug]}</p>
                    <div className="service-row__media" aria-hidden="true">
                      <Picture image={getImage(`services/${s.slug}`)} folder={`services/${s.slug}`} sizes="20vw" cover decorative optional />
                    </div>
                  </div>
                </Draft>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Draft status={PRINCIPLES.status}>
        <section className="section section--charcoal principles" data-theme="dark" aria-labelledby="principles-title">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow eyebrow--light" data-reveal="">
                Why RANCO
              </p>
              <h2 id="principles-title" className="display display--lg" data-lines="">
                {PRINCIPLES.heading}
              </h2>
            </header>
            <ul className="principles__grid">
              {PRINCIPLES.items.map((item, i) => (
                <li key={item.title} data-reveal="">
                  <span className="principles__index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Draft>

      {(projects.length > 0 || IS_PREVIEW) && (
        <section id="projects" className="section section--ivory projects" data-theme="light" aria-labelledby="projects-title">
          <div className="container">
            <header className="section-head">
              <p className="eyebrow" data-reveal="">
                Projects
              </p>
              <h2 id="projects-title" className="display display--lg" data-lines="">
                Featured work
              </h2>
            </header>
            {projects.length > 0 ? (
              <ul className="project-grid">
                {projects.slice(0, 4).map((p) => (
                  <li key={p.slug} className="project-card" data-reveal="">
                    <Picture image={getImage(`projects/${p.slug}/cover`)} folder={`projects/${p.slug}/cover`} sizes="(min-width: 768px) 50vw, 100vw" />
                    <p className="project-card__meta">
                      {p.category} · {p.district}
                    </p>
                    <h3 className="project-card__title">{p.title}</h3>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state" data-reveal="">
                <p>
                  No projects are published yet. Add a folder under <code>media/projects/</code> with photographs and a
                  completed <code>project.json</code>, and set <code>"published": true</code>. See MEDIA_GUIDE.md.
                </p>
                <p className="empty-state__note">This notice appears only in the preview build; production hides the section until a project is published.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section id="story" className="story" data-theme="dark" data-story="" aria-label="Your Vision. Our Craft. Your Home.">
        {STORY.map((s, i) => (
          <div key={s.word} className="story__panel" data-story-panel="">
            <div className="story__media" data-story-media="">
              <Picture image={storyImages[i]} folder="home/storytelling" sizes="100vw" cover decorative />
            </div>
            <div className="story__veil" aria-hidden="true" />
            <div className="container story__content">
              <p className="story__count" aria-hidden="true">
                {String(i + 1).padStart(2, '0')} / {String(STORY.length).padStart(2, '0')}
              </p>
              <h2 className="story__word display">{s.word}</h2>
              <p className="story__text">{s.text}</p>
            </div>
          </div>
        ))}
      </section>

      <Draft status={PROCESS.status}>
        <section id="process" className="section section--ivory process" data-theme="light" aria-labelledby="process-title">
          <div className="container process__grid">
            <header className="section-head process__head">
              <p className="eyebrow" data-reveal="">
                Our process
              </p>
              <h2 id="process-title" className="display display--lg" data-lines="">
                {PROCESS.heading}
              </h2>
            </header>
            <ol className="timeline">
              {PROCESS.steps.map((step, i) => (
                <li key={step.title} className="timeline__step" data-reveal="">
                  <span className="timeline__index">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Draft>

      <section id="areas" className="section section--stone areas" data-theme="light" aria-labelledby="areas-title">
        <div className="container">
          <header className="section-head">
            <p className="eyebrow" data-reveal="">
              Service areas
            </p>
            <h2 id="areas-title" className="display display--lg" data-lines="">
              Central Travancore and surrounding districts
            </h2>
            <p className="lede" data-reveal="">
              RANCO serves homeowners in four districts of Kerala.
            </p>
          </header>
          <ul className="areas__grid">
            {AREAS.map((a) => (
              <li key={a.district} className="area" data-reveal="">
                <Picture image={getImage(`service-areas/${a.district.toLowerCase()}`)} folder={`service-areas/${a.district.toLowerCase()}`} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" cover optional />
                <h3 className="area__name">{a.district}</h3>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="section section--ivory faq" data-theme="light" aria-labelledby="faq-title">
        <div className="container faq__grid">
          <header className="section-head">
            <p className="eyebrow" data-reveal="">
              Questions
            </p>
            <h2 id="faq-title" className="display display--lg" data-lines="">
              Frequently asked questions
            </h2>
          </header>
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

      <section id="contact" className="section contact" data-theme="dark" aria-labelledby="contact-title">
        <div className="contact__media" aria-hidden="true">
          <Picture image={getImage('home/closing')} folder="home/closing" sizes="100vw" cover decorative />
        </div>
        <div className="contact__veil" aria-hidden="true" />
        <div className="container contact__grid">
          <div className="contact__text">
            <p className="eyebrow eyebrow--light" data-reveal="">
              Get in touch
            </p>
            <h2 id="contact-title" className="display display--lg" data-lines="">
              {CONTACT_COPY.heading}
            </h2>
            <p className="lede lede--light" data-reveal="">
              {CONTACT_COPY.text}
            </p>
            <div className="contact__actions" data-reveal="">
              <a className="btn btn--gold" href={SITE.phone.tel}>
                <PhoneIcon /> Call {SITE.phone.display}
              </a>
              <a className="btn btn--outline-light" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon /> WhatsApp <ArrowUpRightIcon />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
          <div className="contact__form" data-reveal="">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  )
}
