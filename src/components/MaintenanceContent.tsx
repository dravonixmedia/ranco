import { CONTACT } from '../content'
import { ContactActions } from './ContactActions'

export function MaintenanceContent() {
  return (
    <main className="content">
      <span className="rule reveal" aria-hidden="true" />
      <h1 className="reveal">
        <span>Our New Website</span> <span>Is Coming Soon</span>
      </h1>
      <p className="lead reveal">Crafted Renovations for Kerala Homes.</p>
      <p className="desc reveal">
        Our new website is on its way. Until then, we’re happy to discuss your villa or apartment renovation.
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
