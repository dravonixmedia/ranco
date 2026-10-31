import { useRef } from 'react'
import { Draft } from '../components/Draft'
import { EnquiryForm } from '../components/EnquiryForm'
import { ArrowIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons'
import { Picture } from '../components/Picture'
import { ABOUT, AREAS, AREAS_INTRO, CONTACT_COPY, FAQS, SERVICE_SUMMARIES } from '../content/home'
import { SHOW_PROJECTS } from '../content/nav'
import { SERVICES, SITE, isVisible } from '../content/site'
import { getImage, getImagesOr, getPublishedProjects } from '../media'
import { useReveal } from '../motion/useReveal'

const pad = (n: number) => String(n).padStart(2, '0')

export function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  const hero = getImage('home/hero')
  // Until their own folders have photos, these slots reuse hero photographs (see MEDIA_GUIDE.md).
  const aboutImage = getImagesOr('home/about', 'home/hero', 2)[0]
  const closingImage = getImagesOr('home/closing', 'home/hero', 3)[0]
  const services = SERVICES.filter((s) => isVisible(s.status))
  const featured = services.find((s) => s.status === 'confirmed') ?? services[0]
  const others = services.filter((s) => s !== featured)
  const featuredImage = getImage(`services/${featured.slug}`) ?? getImagesOr('home/services', 'home/hero', 1)[0]
  const projects = getPublishedProjects()

  return (
    <div ref={root} className="home">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" data-theme="dark" aria-labelledby="hero-title">
        <div className="hero__media">
          <Picture image={hero} folder="home/hero" sizes="100vw" priority cover />
        </div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="container hero__inner">
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">Build Your</span> <span className="hero__line hero__line--accent">Dream Home</span>{' '}
            <span className="hero__line">With Us.</span>
          </h1>
          <p className="hero__lede">
            Home renovation for families in {SITE.districts.slice(0, -1).join(', ')} and {SITE.districts.at(-1)}.
          </p>
          <div className="hero__actions">
            <a className="btn btn--gold" href="#contact">
              Discuss your project <ArrowIcon />
            </a>
            <a className="text-link text-link--light" href={SITE.phone.tel}>
              <PhoneIcon /> {SITE.phone.display}
            </a>
          </div>
        </div>
        <p className="container hero__statement">{SITE.statement}</p>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section id="about" className="section about" data-theme="light" aria-labelledby="about-title">
        <div className="container about__grid">
          <div className="about__text">
            <p className="eyebrow" data-reveal="">
              About RANCO
            </p>
            <h2 id="about-title" className="about__statement" data-reveal="">
              {ABOUT.statement}
            </h2>
            <div className="about__copy">
              {ABOUT.paragraphs.map((p) => (
                <Draft key={p.text} status={p.status}>
                  <p data-reveal="">{p.text}</p>
                </Draft>
              ))}
            </div>
          </div>
          <figure className="about__figure" data-reveal="image">
            <Picture image={aboutImage} folder="home/about" sizes="(min-width: 1024px) 42vw, 100vw" decorative />
          </figure>
        </div>
      </section>

      {/* ── What we do ──────────────────────────────────────── */}
      <section id="services" className="section services" data-theme="light" aria-labelledby="services-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow" data-reveal="">
              What We Do
            </p>
            <h2 id="services-title" className="section-title" data-reveal="">
              {services.length > 1 ? 'Renovation and building services' : 'Home renovation, done with care'}
            </h2>
          </div>
          <article className="feature">
            <figure className="feature__figure" data-reveal="image">
              <Picture image={featuredImage} folder={`services/${featured.slug}`} sizes="(min-width: 1024px) 56vw, 100vw" decorative />
            </figure>
            <div className="feature__text" data-reveal="">
              <p className="feature__n">01</p>
              <h3 className="feature__title">{featured.title}</h3>
              <p className="feature__summary">{SERVICE_SUMMARIES[featured.slug]}</p>
              <a className="text-link" href="#contact">
                Ask about your home <ArrowIcon />
              </a>
            </div>
          </article>
          {others.length > 0 && (
            <ol className="service-list">
              {others.map((s, i) => (
                <li key={s.slug} data-reveal="">
                  <Draft status={s.status}>
                    <div className="service-list__row">
                      <span className="service-list__n">{pad(i + 2)}</span>
                      <h3 className="service-list__title">{s.title}</h3>
                      <p className="service-list__text">{SERVICE_SUMMARIES[s.slug]}</p>
                    </div>
                  </Draft>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── Our projects (verified, published projects only) ── */}
      {SHOW_PROJECTS && (
        <section id="projects" className="section projects" data-theme="light" aria-labelledby="projects-title">
          <div className="container">
            <div className="section-head section-head--row">
              <div>
                <p className="eyebrow" data-reveal="">
                  Our Projects
                </p>
                <h2 id="projects-title" className="section-title" data-reveal="">
                  Selected work
                </h2>
              </div>
            </div>
            {projects.length > 0 ? (
              <ul className="portfolio">
                {projects.slice(0, 4).map((p) => (
                  <li key={p.slug} className="portfolio__item" data-reveal="image">
                    <figure>
                      <Picture image={getImage(`projects/${p.slug}/cover`)} folder={`projects/${p.slug}/cover`} sizes="(min-width: 768px) 50vw, 100vw" />
                    </figure>
                    <p className="portfolio__meta">
                      {p.category} <span aria-hidden="true">·</span> {p.district}
                    </p>
                    <h3 className="portfolio__title">{p.title}</h3>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state" data-reveal="">
                <p className="empty-state__title">Verified RANCO projects will appear here.</p>
                <p>
                  Add a folder under <code>media/projects/</code> with photographs and a completed <code>project.json</code>, then set{' '}
                  <code>"published": true</code>. See MEDIA_GUIDE.md.
                </p>
                <p className="empty-state__note">Preview only: production hides this section until a project is published.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Where we work ───────────────────────────────────── */}
      <section id="areas" className="section areas" data-theme="dark" aria-labelledby="areas-title">
        <div className="container areas__grid">
          <div className="areas__head">
            <p className="eyebrow" data-reveal="">
              Where We Work
            </p>
            <h2 id="areas-title" className="section-title" data-reveal="">
              Four districts of central Kerala
            </h2>
            <p className="areas__intro" data-reveal="">
              {AREAS_INTRO}
            </p>
          </div>
          <ul className="districts">
            {AREAS.map((a) => (
              <li key={a.district} className="district" data-reveal="">
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

      {/* ── Contact ─────────────────────────────────────────── */}
      <section id="contact" className="contact" data-theme="dark" aria-labelledby="contact-title">
        <div className="contact__banner">
          <Picture image={closingImage} folder="home/closing" sizes="100vw" cover decorative />
          <div className="contact__shade" aria-hidden="true" />
          <div className="container contact__head">
            <p className="eyebrow eyebrow--light" data-reveal="">
              Contact
            </p>
            <h2 id="contact-title" className="contact__title" data-reveal="">
              {CONTACT_COPY.heading}
            </h2>
            <p className="contact__lede" data-reveal="">
              {CONTACT_COPY.text}
            </p>
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
            <p className="contact__areas">Serving {SITE.districts.join(', ')}</p>
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
