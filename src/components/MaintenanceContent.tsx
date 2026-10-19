import { CONTACT } from '../content'
import { ContactActions } from './ContactActions'

export function MaintenanceContent() {
  return (
    <main className="content">
      <span className="rule reveal" aria-hidden="true" />
      <h1 className="reveal">
        <span>Build Your Dream</span> <span>Home With Us.</span>
      </h1>
      <p className="lead reveal">Crafting Spaces. Creating Dreams.</p>
      <p className="desc reveal">
        From your first idea to the final detail, RANCO brings your vision to life with thoughtful design, quality
        workmanship, and attention to every detail.
      </p>
      <ContactActions />
      <div className="enquiries reveal">
        <span className="enquiries-label">For Enquiries</span>
        <a className="enquiries-number" href={CONTACT.tel}>
          {CONTACT.display}
        </a>
      </div>
    </main>
  )
}
