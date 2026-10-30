import { useId, useState, type FormEvent } from 'react'
import { SERVICES, SITE, isVisible, whatsappLink } from '../content/site'

interface Fields {
  name: string
  phone: string
  district: string
  service: string
  details: string
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = { name: '', phone: '', district: '', service: '', details: '' }

/** Indian phone numbers: 10 digits, optionally prefixed with +91, 91 or 0. */
export function normalisePhone(value: string): string | null {
  const digits = value.replace(/[\s()-]/g, '')
  const match = /^(?:\+?91|0)?([6-9]\d{9})$/.exec(digits)
  return match ? `+91 ${match[1].slice(0, 5)} ${match[1].slice(5)}` : null
}

export function validate(f: Fields): Errors {
  const errors: Errors = {}
  if (f.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!normalisePhone(f.phone)) errors.phone = 'Please enter a 10-digit mobile number.'
  if (!f.district) errors.district = 'Please choose a district.'
  if (!f.service) errors.service = 'Please choose the type of work.'
  if (f.details.trim().length < 10) errors.details = 'Please describe the work in a sentence or two.'
  return errors
}

export function composeMessage(f: Fields): string {
  return [
    `Hello ${SITE.name}, I would like to discuss a project.`,
    `Name: ${f.name.trim()}`,
    `Phone: ${normalisePhone(f.phone)}`,
    `District: ${f.district}`,
    `Work: ${f.service}`,
    `Details: ${f.details.trim()}`,
  ].join('\n')
}

/**
 * Enquiry form with an honest WhatsApp handoff: it prepares the message and
 * opens WhatsApp. Nothing is stored or sent by this website.
 */
export function EnquiryForm() {
  const id = useId()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [handoff, setHandoff] = useState<{ url: string; opened: boolean } | null>(null)

  const services = SERVICES.filter((s) => isVisible(s.status)).map((s) => s.title)
  const set = (key: keyof Fields) => (e: { target: { value: string } }) => setFields((f) => ({ ...f, [key]: e.target.value }))

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      setHandoff(null)
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }
    const url = whatsappLink(composeMessage(fields))
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    setHandoff({ url, opened: win !== null })
  }

  const field = (key: keyof Fields) => ({
    id: `${id}-${key}`,
    name: key,
    value: fields[key],
    onChange: set(key),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
  })
  const error = (key: keyof Fields) =>
    errors[key] ? (
      <p className="field__error" id={`${id}-${key}-error`}>
        {errors[key]}
      </p>
    ) : null

  return (
    <form className="enquiry" onSubmit={onSubmit} noValidate aria-describedby={`${id}-privacy`}>
      <div className="enquiry__grid">
        <div className="field">
          <label htmlFor={`${id}-name`}>Name</label>
          <input {...field('name')} type="text" autoComplete="name" required />
          {error('name')}
        </div>
        <div className="field">
          <label htmlFor={`${id}-phone`}>Phone</label>
          <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" required />
          {error('phone')}
        </div>
        <div className="field">
          <label htmlFor={`${id}-district`}>District</label>
          <select {...field('district')} required>
            <option value="">Choose…</option>
            {SITE.districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
            <option>Other (nearby)</option>
          </select>
          {error('district')}
        </div>
        <div className="field">
          <label htmlFor={`${id}-service`}>Type of work</label>
          <select {...field('service')} required>
            <option value="">Choose…</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option>Something else</option>
          </select>
          {error('service')}
        </div>
        <div className="field field--wide">
          <label htmlFor={`${id}-details`}>Project details</label>
          <textarea {...field('details')} rows={4} required />
          {error('details')}
        </div>
      </div>
      <p className="enquiry__privacy" id={`${id}-privacy`}>
        This form does not store or send your details. It opens WhatsApp with your message ready, and nothing is sent
        until you press send there.
      </p>
      <button type="submit" className="btn btn--gold">
        Continue in WhatsApp
      </button>
      <div className="enquiry__status" role="status" aria-live="polite">
        {handoff &&
          (handoff.opened ? (
            <p>
              WhatsApp has opened with your message. <strong>Press send in WhatsApp to deliver it</strong>; it has not
              been sent yet. If it did not open,{' '}
              <a href={handoff.url} target="_blank" rel="noopener noreferrer">
                open WhatsApp here
              </a>
              .
            </p>
          ) : (
            <p>
              Your browser blocked the new tab.{' '}
              <a href={handoff.url} target="_blank" rel="noopener noreferrer">
                Open WhatsApp with your message
              </a>
              , then press send. Nothing has been sent yet.
            </p>
          ))}
      </div>
      <noscript>
        <p className="enquiry__privacy">
          This form needs JavaScript. You can call <a href={SITE.phone.tel}>{SITE.phone.display}</a> or message us on{' '}
          <a href={SITE.whatsapp}>WhatsApp</a> instead.
        </p>
      </noscript>
    </form>
  )
}
