import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '../components/ui/Toaster'
import { useUiStore } from '../stores/uiStore'
import { watchDayRollover } from './bootstrap'
import { AppProviders } from './providers'
import { AppRoutes } from './routes'

/**
 * The application root.
 *
 * Stores are hydrated by `bootstrap()` in `main.tsx` before this renders, so
 * nothing here has to cope with a half-loaded first frame. What it does own is
 * the rollover watcher — a tab left open across midnight has to notice the date
 * changed — and the toast viewport, which sits outside the routes so a message
 * survives navigation.
 */
function App() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)

  useEffect(() => watchDayRollover(), [])

  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
        <Toaster toasts={toasts} onDismiss={dismissToast} />
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
