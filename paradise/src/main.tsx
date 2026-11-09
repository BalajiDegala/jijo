import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, ErrorBoundary } from './App'
import '@fontsource/kalam/latin-400.css'
import '@fontsource/kalam/latin-700.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.warn('Offline caching could not start', error))
  })
}
