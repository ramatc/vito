import { INTL_LOCALE_TAG } from '../i18n/locale'
import type { AppPreferences, Theme } from '../types/models'

/**
 * The only writer of `<html>`.
 *
 * Three things live outside React's tree and therefore outside every component:
 * the `dark` class the whole stylesheet keys off, the `lang` attribute screen
 * readers and hyphenation use to pick a voice, and the `theme-color` meta mobile
 * browsers tint their address bar with. Centralising them here is what keeps
 * "the document reflects the preferences" a single fact with a single owner,
 * rather than three effects that can drift apart.
 *
 * Called from exactly two moments, both in `app/`: once in `bootstrap()` before
 * the first paint, and again from an effect in `App` on every later change.
 */

/**
 * The address-bar tint per theme.
 *
 * Duplicates `--surface` from `index.css` on purpose. A `<meta>` attribute takes
 * a colour, not a custom property, and resolving one through `getComputedStyle`
 * would make the first paint depend on the stylesheet having already loaded —
 * the exact race this function exists to avoid. Keep the two in step: these are
 * the light and dark values of `--surface`.
 */
const THEME_COLOR: Record<Theme, string> = {
  light: '#f8fafc',
  dark: '#0f172a',
}

export function applyDocumentPreferences(preferences: AppPreferences): void {
  const html = document.documentElement

  // Toggled, not assigned: `<html>` is shared ground, and overwriting className
  // would drop any class a browser extension or a future feature parked there.
  html.classList.toggle('dark', preferences.theme === 'dark')
  html.lang = INTL_LOCALE_TAG[preferences.locale]

  // Optional by design. The meta is declared in index.html, but an embedded or
  // test document may have none, and this runs inside bootstrap() — throwing
  // here would trade a missing address-bar tint for a blank app.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[preferences.theme])
}
