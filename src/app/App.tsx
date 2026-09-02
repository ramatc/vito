import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '../components/ui/Toaster'
import { usePreferencesStore } from '../stores/preferencesStore'
import { useUiStore } from '../stores/uiStore'
import { watchDayRollover } from './bootstrap'
import { applyDocumentPreferences } from './documentPreferences'
import { ErrorBoundary } from './ErrorBoundary'
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
 *
 * It also keeps `<html>` in step with the preferences. `bootstrap()` dresses the
 * document once before the first paint, which covers a reload; this covers every
 * change after it, because `<html>` is above the React tree and no component can
 * reach it.
 */
function App() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)
  const storageError = useUiStore((state) => state.storageError)
  const preferences = usePreferencesStore((state) => state.preferences)

  useEffect(() => watchDayRollover(), [])

  // The whole pair, not the field that changed: language and theme are written
  // by two separate controls, and re-applying only one would leave the document
  // describing a state the store never held.
  useEffect(() => {
    applyDocumentPreferences(preferences)
  }, [preferences])

  return (
    <AppProviders>
      <BrowserRouter>
        {/*
          A live region rather than a silent strip: the one thing that must not
          happen is someone completing habits for ten minutes while nothing is
          being written. The copy names the likely cause instead of only stating
          the symptom, because "might not be saving" alone leaves nothing to do
          about it.
        */}
        {storageError !== null && (
          <div
            role="status"
            aria-live="polite"
            className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-800"
          >
            Vito can&apos;t save to this browser right now, so today&apos;s progress might
            not be kept. Check that site data is allowed and that storage isn&apos;t full.
          </div>
        )}
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster toasts={toasts} onDismiss={dismissToast} />
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
