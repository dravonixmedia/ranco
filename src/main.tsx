import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root element missing from index.html')

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production HTML is prerendered (scripts/prerender.mjs), so hydrate it;
// the Vite dev server serves the bare template, so render from scratch.
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)
