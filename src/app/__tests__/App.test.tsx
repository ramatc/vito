import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { setRepositories } from '../../stores/repositories'
import { createFakeRepositories } from '../../test/fakeRepositories'
import App from '../App'

// Relocated from the PR1 smoke test at src/App.test.tsx, which rendered the
// placeholder shell this phase deleted. Still the same job: prove jsdom, React
// Testing Library, jest-dom and the Vitest setup file are wired up — now with
// the routed shell it has to boot through. Behaviour lives in the domain and
// store suites, not here.
describe('App', () => {
  it('renders the Today screen inside the app shell', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary sidebar' }),
    ).toBeInTheDocument()
    // Home's new contract (PR5): Vito and the progress bars both render.
    expect(screen.getByRole('region', { name: 'Vito' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Your progress' })).toBeInTheDocument()
  })
})

/**
 * `bootstrap()` dresses the document once, before the first paint. That covers
 * a reload but not a toggle: after startup the only thing that knows the theme
 * changed is the store, and `<html>` sits outside React's tree. This effect is
 * the bridge, and these cases drive it the way Settings will — through the
 * store's own actions, not by poking state.
 */
describe('App — keeping the document in step with the preferences', () => {
  const html = document.documentElement

  beforeEach(() => {
    setRepositories(createFakeRepositories().repos)
    usePreferencesStore.setState({ preferences: { locale: 'en', theme: 'light' } })
  })

  afterEach(() => {
    html.className = ''
    html.removeAttribute('lang')
  })

  it('dresses the document from the preferences it renders with', () => {
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'dark' } })

    render(<App />)

    expect(html.classList.contains('dark')).toBe(true)
    expect(html.lang).toBe('es')
  })

  it('switches the theme while the app is running', async () => {
    render(<App />)

    await act(async () => {
      await usePreferencesStore.getState().setTheme('dark')
    })

    expect(html.classList.contains('dark')).toBe(true)
  })

  it('switches back again, and follows the language too', async () => {
    usePreferencesStore.setState({ preferences: { locale: 'es', theme: 'dark' } })
    render(<App />)

    await act(async () => {
      await usePreferencesStore.getState().setTheme('light')
      await usePreferencesStore.getState().setLocale('en')
    })

    expect(html.classList.contains('dark')).toBe(false)
    expect(html.lang).toBe('en-US')
  })

  /**
   * Changing one setting must not reset the other on the document. The store
   * spreads the pair rather than replacing it; this pins that the effect passes
   * the whole pair on instead of the field that happened to change.
   */
  it('keeps the theme when only the language moves', async () => {
    usePreferencesStore.setState({ preferences: { locale: 'en', theme: 'dark' } })
    render(<App />)

    await act(async () => {
      await usePreferencesStore.getState().setLocale('es')
    })

    expect(html.lang).toBe('es')
    expect(html.classList.contains('dark')).toBe(true)
  })
})
