import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { bootstrap } from './app/bootstrap'

const container = document.getElementById('root')

if (container === null) {
  throw new Error('Missing #root element in index.html')
}

// Hydrate and settle the day BEFORE the first render, so the UI never paints an
// empty day it would immediately replace. localStorage is synchronous, so this
// costs a microtask, not a spinner.
//
// A failure still renders: the repositories fall back to first-run defaults
// rather than throwing, and a blank page would be a far worse outcome than a
// fresh-looking one.
bootstrap()
  .catch((error: unknown) => {
    console.error('Vito could not load saved data; starting from defaults.', error)
  })
  .finally(() => {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
