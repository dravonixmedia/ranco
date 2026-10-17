import { CONTACT } from '../content'
import { ContactActions } from './ContactActions'

export function MaintenanceContent() {
  return (
    <main className="content">
      <span className="rule reveal" aria-hidden="true" />
      <h1 className="reveal">
        <span>Website Under</span> <span>Maintenance</span>
      </h1>
      <p className="lead reveal">We’re Working on Something Better.</p>
      <p className="desc reveal">
        Our website is temporarily unavailable as we prepare a better digital experience. We’ll be back shortly.
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
