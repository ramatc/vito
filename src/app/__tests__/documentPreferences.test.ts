import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AppPreferences } from '../../types/models'
import { applyDocumentPreferences } from '../documentPreferences'

/**
 * The document is the one piece of the UI React does not own: `<html>` carries
 * the theme class the whole stylesheet keys off, the `lang` assistive tech reads
 * a page in, and the address-bar colour on mobile. This is the only writer of
 * all three, so these tests are the only place that contract is pinned.
 */

const html = document.documentElement

function themeColor(): string | null {
  return (
    document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null
  )
}

function preferences(overrides: Partial<AppPreferences> = {}): AppPreferences {
  return { locale: 'en', theme: 'light', ...overrides }
}

beforeEach(() => {
  html.className = ''
  html.removeAttribute('lang')

  // jsdom serves a bare document; the real one declares this meta in index.html.
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', '#ffffff')
  document.head.append(meta)
})

afterEach(() => {
  html.className = ''
  html.removeAttribute('lang')
  document.querySelector('meta[name="theme-color"]')?.remove()
})

describe('applyDocumentPreferences — the theme class', () => {
  it('marks the document dark when the dark theme is active', () => {
    applyDocumentPreferences(preferences({ theme: 'dark' }))

    expect(html.classList.contains('dark')).toBe(true)
  })

  it('unmarks it again when the theme goes back to light', () => {
    applyDocumentPreferences(preferences({ theme: 'dark' }))
    applyDocumentPreferences(preferences({ theme: 'light' }))

    expect(html.classList.contains('dark')).toBe(false)
  })

  /**
   * Toggled rather than assigned. `<html>` is shared ground — a stray
   * `className = 'dark'` would silently drop anything else parked there.
   */
  it('leaves classes it does not own alone', () => {
    html.className = 'js-enabled'

    applyDocumentPreferences(preferences({ theme: 'dark' }))

    expect(html.classList.contains('js-enabled')).toBe(true)
    expect(html.classList.contains('dark')).toBe(true)
  })
})

describe('applyDocumentPreferences — the language tag', () => {
  it('publishes the BCP 47 tag for Spanish, not the bucket name', () => {
    applyDocumentPreferences(preferences({ locale: 'es' }))

    expect(html.lang).toBe('es')
  })

  it('publishes the regional tag for English', () => {
    applyDocumentPreferences(preferences({ locale: 'en' }))

    expect(html.lang).toBe('en-US')
  })
})

describe('applyDocumentPreferences — the address-bar colour', () => {
  it('paints the browser chrome with the dark surface', () => {
    applyDocumentPreferences(preferences({ theme: 'dark' }))

    expect(themeColor()).toBe('#0f172a')
  })

  it('paints it with the light surface again', () => {
    applyDocumentPreferences(preferences({ theme: 'dark' }))
    applyDocumentPreferences(preferences({ theme: 'light' }))

    expect(themeColor()).toBe('#f8fafc')
  })

  /**
   * The meta is declared in `index.html`, but a test harness or an embedded
   * context may not have one. Losing the address-bar tint is a cosmetic miss;
   * throwing here would happen inside `bootstrap()` and cost the whole app.
   */
  it('still applies the theme and language when the meta is missing', () => {
    document.querySelector('meta[name="theme-color"]')?.remove()

    applyDocumentPreferences(preferences({ locale: 'es', theme: 'dark' }))

    expect(html.classList.contains('dark')).toBe(true)
    expect(html.lang).toBe('es')
  })
})
