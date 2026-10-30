import { useRef, type CSSProperties } from 'react'
import { ChapterMarker } from '../components/ChapterMarker'
import { Draft } from '../components/Draft'
import { EnquiryForm } from '../components/EnquiryForm'
import { ArrowIcon, PhoneIcon, WhatsAppIcon } from '../components/Icons'
import { Lines } from '../components/Lines'
import { Picture } from '../components/Picture'
import { APERTURE_FULL, ROOF_DESKTOP, ROOF_MOBILE, Roofline, aperturePolygon } from '../components/Roofline'
import { CHAPTERS, SHOW_PROJECTS, chapterNumber } from '../content/chapters'
import { AREAS, CONTACT_COPY, FAQS, SCENES, SERVICE_SUMMARIES } from '../content/home'
import { IS_PREVIEW, SERVICES, SITE, isVisible } from '../content/site'
import { getImage, getImages, getImagesOr, getPublishedProjects, type MediaImage } from '../media'
import { useHomeMotion } from '../motion/useHomeMotion'

/**
 * Photo slots for a composition. The preview shows every slot, labelling empty
 * ones as placeholders; production shows only real photographs.
 */
function slots(images: MediaImage[], count: number): (MediaImage | undefined)[] {
  if (!IS_PREVIEW) return images.slice(0, count)
  return Array.from({ length: count }, (_, i) => images[i])
}

/** Chapter label, e.g. "(02) Our Craft". */
function Chapter({ id }: { id: string }) {
  const chapter = CHAPTERS.find((c) => c.id === id)
  return (
    <p className="chapter-label">
      <span className="chapter-label__n">({chapterNumber(id)})</span> {chapter?.label}
    </p>
  )
}

const PLACEHOLDER_NOTE = 'Preview placeholder · not a RANCO project'

export function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  useHomeMotion(root)

  const hero = getImage('home/hero')
  const heroAll = getImages('home/hero')
  const gallery = slots(getImagesOr('home/gallery', 'home/hero'), 7)
  const vision = getImagesOr('home/vision', 'home/hero', 1)
  const craft = getImagesOr('home/craft', 'home/hero', 2)
  const strip = getImagesOr('home/strip', 'home/hero', 3)[0] ?? heroAll[0]
  const services = SERVICES.filter((s) => isVisible(s.status))
  const featured = services.find((s) => s.status === 'confirmed') ?? services[0]
  const others = services.filter((s) => s !== featured)
  const featureImage = getImage(`services/${featured.slug}`) ?? heroAll[0]
  // "Home Renovation" → HOME / *Renovation*: the second word becomes the accent.
  const [firstWord, ...rest] = featured.title.split(' ')
  const featuredLines = rest.length ? [{ text: firstWord }, { text: rest.join(' '), accent: rest.join(' ') }] : [{ text: featured.title }]
  const plates = slots(getImagesOr('home/walkthrough', 'home/hero'), 6)
  const projects = getPublishedProjects()
  const statementImage = getImagesOr('home/statement', 'home/hero', 3)[0]
  const closingImage = getImagesOr('home/closing', 'home/hero', 1)[0]

  return (
    <div ref={root} className="home">
      <ChapterMarker />
      {/* ── Opening ─────────────────────────────────────────── */}
      <section className="scene opening" data-theme="dark" data-scene="opening" aria-labelledby="hero-title">
        <div className="scene__stage opening__stage">
          <div
            className="opening__photo"
            data-aperture=""
            style={{ '--aperture-desktop': aperturePolygon(ROOF_DESKTOP), '--aperture-mobile': aperturePolygon(ROOF_MOBILE), '--aperture-full': APERTURE_FULL } as CSSProperties}
          >
            <div className="opening__media" data-hero-media="">
              <Picture image={hero} folder="home/hero" sizes="100vw" priority cover />
            </div>
          </div>
          <div className="opening__sculpture" data-roof="">
            <Roofline geometry={ROOF_DESKTOP} variant="desktop" />
            <Roofline geometry={ROOF_MOBILE} variant="mobile" />
          </div>
          <div className="opening__copy">
            <p className="opening__kicker" data-hero-item="">
              {SITE.tagline} <span aria-hidden="true">·</span> {SITE.region}
            </p>
            <h1 id="hero-title" className="caps opening__title" data-hero-title="">
              <Lines lines={[{ text: 'Build Your' }, { text: 'Dream Home', accent: 'Dream' }, { text: 'With Us.' }]} />
            </h1>
            <div className="opening__foot" data-hero-item="">
              <p className="opening__statement">{SITE.statement}</p>
              <a className="btn btn--gold" href="#contact">
                Begin your project <ArrowIcon />
              </a>
            </div>
          </div>
          <a className="scroll-cue" href="#gallery" data-hero-item="" aria-label="Scroll to begin">
            <span className="scroll-cue__line" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ── A home, gathered: the floating gallery ─────────── */}
      <section id="gallery" className="scene gallery" data-theme="light" data-scene="gallery" aria-labelledby="gallery-title">
        <div className="scene__stage gallery__stage">
          <h2 id="gallery-title" className="caps gallery__title" data-gallery-title="" data-lines="">
            <Lines lines={SCENES.gallery.lines} />
          </h2>
          <ul className="gallery__frames">
            {gallery.map((image, i) => (
              <li key={i} className={`frame frame--${i + 1}`} data-frame={i}>
                <Picture image={image} folder="home/gallery" sizes="(min-width: 1024px) 40vw, 70vw" cover decorative />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 01 Your Vision ───────────────────────────────────── */}
      <section id="vision" className="scene vision" data-theme="dark" data-scene="vision" data-chapter="vision" aria-labelledby="vision-title">
        <div className="container vision__grid">
          <Chapter id="vision" />
          <h2 id="vision-title" className="caps vision__title" data-lines="">
            <Lines lines={SCENES.vision.title} />
          </h2>
          <div className="vision__copy" data-reveal="">
            <p className="vision__lede">{SCENES.vision.lede}</p>
            <Draft status={SCENES.vision.status}>
              <p className="vision__text">{SCENES.vision.text}</p>
            </Draft>
          </div>
          <figure className="vision__photo" data-depth="1.4">
            <Picture image={vision[0]} folder="home/vision" sizes="(min-width: 1024px) 44vw, 100vw" cover decorative />
          </figure>
          <figure className="vision__detail" data-depth="2.2">
            <Picture image={vision[1] ?? heroAll[0]} folder="home/vision" sizes="(min-width: 1024px) 18vw, 40vw" cover decorative />
          </figure>
          <svg className="vision__lines" viewBox="0 0 400 300" aria-hidden="true" focusable="false" data-depth="0.6">
            <path d="M0 210 L180 90 L360 210" pathLength={1} />
            <path d="M40 210 H320" pathLength={1} />
            <path d="M180 90 V20" pathLength={1} />
          </svg>
        </div>
      </section>

      {/* ── 02 Our Craft ─────────────────────────────────────── */}
      <section id="craft" className="scene craft" data-theme="light" data-scene="craft" data-chapter="craft" aria-labelledby="craft-title">
        <figure className="strip" data-strip="">
          <Picture image={strip} folder="home/strip" sizes="100vw" cover decorative />
        </figure>
        <div className="container craft__spread">
          <figure className="craft__photo" data-clip="">
            <Picture image={craft[0]} folder="home/craft" sizes="(min-width: 1024px) 50vw, 100vw" cover decorative />
          </figure>
          <div className="craft__head">
            <Chapter id="craft" />
            <h2 id="craft-title" className="caps craft__title" data-lines="">
              <Lines lines={SCENES.craft.title} />
            </h2>
          </div>
          <p className="craft__text" data-reveal="">
            {SCENES.craft.text}
          </p>
          <figure className="craft__small" data-depth="1.6">
            <Picture image={craft[1] ?? heroAll[0]} folder="home/craft" sizes="(min-width: 1024px) 20vw, 50vw" cover decorative />
          </figure>
        </div>
        <div className="materials" aria-label="Materials">
          <p className="materials__band caps" aria-hidden="true" data-drift="">
            {SCENES.craft.materials.map((m) => (
              <span key={m.name}>
                {m.name} <em className="acc">·</em>{' '}
              </span>
            ))}
          </p>
          <Draft status={SCENES.craft.materialsStatus}>
            <ol className="container materials__list">
              {SCENES.craft.materials.map((m, i) => (
                <li key={m.name} data-reveal="">
                  <span className="materials__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{m.name}</h3>
                  <p>{m.note}</p>
                </li>
              ))}
            </ol>
          </Draft>
        </div>
      </section>

      {/* ── 03 What We Create ───────────────────────────────── */}
      <section id="services" className="scene create" data-theme="dark" data-scene="create" data-chapter="services" aria-labelledby="services-title">
        <div className="scene__stage create__stage">
          <div className="create__photo" data-create-photo="">
            <Picture image={featureImage} folder={`services/${featured.slug}`} sizes="100vw" cover decorative />
          </div>
          <div className="create__shade" aria-hidden="true" />
          <div className="container create__copy">
            <Chapter id="services" />
            <h2 id="services-title" className="caps create__title" data-create-title="">
              <Lines lines={featuredLines} />
            </h2>
            <p className="create__text" data-create-text="">
              {SERVICE_SUMMARIES[featured.slug]}
            </p>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="scene create-more" data-theme="dark" data-chapter="services" aria-label="More services">

            <ol className="container services-index">
              {others.map((s, i) => (
                <li key={s.slug} data-reveal="">
                  <Draft status={s.status}>
                    <div className="services-index__row">
                      <span className="services-index__n">{String(i + 2).padStart(2, '0')}</span>
                      <h3 className="caps services-index__title">{s.title}</h3>
                      <p className="services-index__text">{SERVICE_SUMMARIES[s.slug]}</p>
                    </div>
                  </Draft>
                </li>
              ))}
            </ol>
        </section>
      )}

      {/* ── 04 Your Home: the exhibition walkthrough ────────── */}
      <section id="walkthrough" className="scene walk" data-theme="dark" data-scene="walk" data-chapter="walkthrough" aria-labelledby="walk-title">
        <div className="scene__stage walk__stage">
          <div className="walk__copy">
            <Chapter id="walkthrough" />
            <h2 id="walk-title" className="caps walk__title" data-lines="">
              <Lines lines={SCENES.walkthrough.title} />
            </h2>
            <p className="walk__text" data-reveal="">
              {SCENES.walkthrough.text}
            </p>
          </div>
          <p className="walk__count" aria-hidden="true">
            <span data-walk-count="">01</span> / {String(plates.length).padStart(2, '0')}
          </p>
          <div className="walk__room" data-walk-room="">
            <div className="walk__floor" aria-hidden="true" />
            <div className="walk__ceiling" aria-hidden="true" />
            <ol className="walk__plates" data-walk-world="">
              {plates.map((image, i) => (
                <li key={i} className={`plate plate--${i % 2 ? 'right' : 'left'}`} data-plate={i}>
                  <figure>
                    <div className="plate__frame">
                      <Picture image={image} folder="home/walkthrough" sizes="(min-width: 1024px) 34vw, 80vw" cover placeholder={PLACEHOLDER_NOTE} />
                    </div>
                    <figcaption className="plate__label">
                      <span className="plate__n">{String(i + 1).padStart(2, '0')}</span>
                      <span>{image ? SCENES.walkthrough.note : 'Placeholder'}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 05 Our Work (verified, published projects only) ── */}
      {SHOW_PROJECTS && (
        <section id="projects" className="scene work" data-theme="light" data-scene="work" data-chapter="projects" aria-labelledby="projects-title">
          <div className="container">
            <div className="work__head">
              <Chapter id="projects" />
              <h2 id="projects-title" className="caps work__title" data-lines="">
                <Lines lines={[{ text: 'Our' }, { text: 'Work', accent: 'Work' }]} />
              </h2>
              {projects.length === 0 && <p className="work__note">Preview only: these frames are placeholders, not RANCO projects. Production hides this chapter until a verified project is published.</p>}
            </div>
            <ul className="work__list">
              {(projects.length ? projects.slice(0, 3) : [undefined, undefined, undefined]).map((p, i) => (
                <li key={p?.slug ?? i} className={`work__item work__item--${i + 1}`}>
                  <figure data-gable="">
                    <Picture image={p ? getImage(`projects/${p.slug}/cover`) : undefined} folder={p ? `projects/${p.slug}/cover` : 'projects'} sizes="(min-width: 768px) 50vw, 100vw" placeholder={PLACEHOLDER_NOTE} />
                  </figure>
                  {p ? (
                    <>
                      <p className="work__meta">
                        {p.category} <span aria-hidden="true">—</span> {p.district}
                      </p>
                      <h3 className="work__name">{p.title}</h3>
                    </>
                  ) : (
                    <p className="work__meta">Placeholder {String(i + 1).padStart(2, '0')}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── 06 Where We Build ───────────────────────────────── */}
      <section id="areas" className="scene areas" data-theme="dark" data-scene="areas" data-chapter="areas" aria-labelledby="areas-title">
        <div className="scene__stage areas__stage">
          <div className="container areas__grid">
            <div className="areas__head">
              <Chapter id="areas" />
              <h2 id="areas-title" className="caps areas__title" data-lines="">
                <Lines lines={SCENES.areas.title} />
              </h2>
              <p className="areas__intro" data-reveal="">
                {SCENES.areas.text}
              </p>
            </div>
            <figure className="route" aria-hidden="true">
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" focusable="false">
                <path className="route__path" data-route="" pathLength={1} d="M38 46 C 44 60, 50 70, 54 82 C 62 70, 70 52, 76 38 C 60 28, 42 20, 28 14" />
                {[
                  [38, 46],
                  [54, 82],
                  [76, 38],
                  [28, 14],
                ].map(([x, y], i) => (
                  <g key={i} className="route__node" data-route-node={i}>
                    <circle cx={x} cy={y} r="3.2" className="route__halo" />
                    <circle cx={x} cy={y} r="0.9" />
                    <text x={x + (i === 2 ? -4 : 4)} y={y + 1} textAnchor={i === 2 ? 'end' : 'start'}>
                      {AREAS[i].district}
                    </text>
                  </g>
                ))}
              </svg>
              <figcaption>Illustrative, not to scale</figcaption>
            </figure>
            <ol className="district-cards" data-cards="">
              {AREAS.map((a, i) => (
                <li key={a.district} className="district" data-card={i}>
                  <p className="district__n">
                    {String(i + 1).padStart(2, '0')} <span aria-hidden="true">/ 04</span>
                  </p>
                  <h3 className="caps district__name">{a.district}</h3>
                  <p className="district__text">{a.text}</p>
                  <p className="district__serve">Serving homeowners in {a.district} district</p>
                </li>
              ))}
              <li className="district-cards__bars" aria-hidden="true">
                {AREAS.map((a) => (
                  <span key={a.district} data-bar="" />
                ))}
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ── Crafting spaces ─────────────────────────────────── */}
      <section className="scene statement" data-theme="light" data-scene="statement" aria-label={SITE.statement}>
        <div className="statement__backdrop" aria-hidden="true">
          <Picture image={statementImage} folder="home/statement" sizes="60vw" cover decorative />
        </div>
        <p className="caps statement__text" data-sweep="">
          <Lines lines={SCENES.statement} />
        </p>
      </section>

      {/* ── 07 Questions ─────────────────────────────────────── */}
      <section id="faq" className="scene faq" data-theme="light" data-scene="faq" data-chapter="faq" aria-labelledby="faq-title">
        <div className="container faq__grid">
          <div className="faq__head">
            <Chapter id="faq" />
            <h2 id="faq-title" className="caps faq__title" data-lines="">
              <Lines lines={[{ text: 'Questions,' }, { text: 'answered', accent: 'answered' }]} />
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

      {/* ── Begin your project ──────────────────────────────── */}
      <section id="contact" className="scene closing" data-theme="dark" data-scene="closing" data-chapter="contact" aria-labelledby="contact-title">
        <figure className="strip strip--closing" data-strip="">
          <Picture image={closingImage} folder="home/closing" sizes="100vw" cover decorative />
        </figure>
        <div className="container closing__inner">
          <Chapter id="contact" />
          <h2 id="contact-title" className="caps closing__title" data-sweep="">
            <Lines lines={SCENES.closing} />
          </h2>
          <p className="closing__lede">{CONTACT_COPY.text}</p>
          <div className="closing__actions">
            <a className="btn btn--gold btn--large" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> WhatsApp us
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <a className="btn btn--outline-light btn--large" href={SITE.phone.tel}>
              <PhoneIcon /> Call {SITE.phone.display}
            </a>
          </div>
          <div className="closing__form">
            <div className="closing__form-head">
              <h3>Prefer to write?</h3>
              <p>Share a few details and continue the conversation on WhatsApp.</p>
            </div>
            <EnquiryForm />
          </div>
        </div>
      </section>
    </div>
  )
}
