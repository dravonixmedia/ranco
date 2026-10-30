import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import { routeById, routeForPath } from './routes'
import './styles.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root element missing from index.html')

// Prerendered pages name their route (so the 404 page hydrates as the 404 page
// whatever the URL); the Vite dev server serves the bare template, so fall back to the path.
const route = (container.dataset.route && routeById(container.dataset.route)) || routeForPath(location.pathname)

const app = (
  <StrictMode>
    <App route={route} />
  </StrictMode>
)

if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)
