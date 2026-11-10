import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/base.css'
import './styles/metal.css'
import { App } from './App'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Production pages ship prerendered HTML (scripts/prerender.mjs). Hydrate it when it matches this route.
const prerendered = root.dataset.route
const path = location.pathname.replace(/\/$/, '') || '/'
if (prerendered && prerendered === path) hydrateRoot(root, app)
else {
  root.textContent = ''
  createRoot(root).render(app)
}
