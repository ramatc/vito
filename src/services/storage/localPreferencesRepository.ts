import type { AppPreferences } from '../../types/models'
import { createDefaultPreferences } from './defaults'
import { STORAGE_KEYS, isRecord, read, write } from './localStorageClient'
import type { PreferencesRepository } from './repositories'

/**
 * Language and theme, validated field by field.
 *
 * Per-field rather than all-or-nothing on purpose: these two settings are
 * independent, and a save that lost a readable theme because the language next
 * to it was garbage would be throwing away good data. A user who edited
 * devtools, or a save written by a build that shipped a third locale, keeps
 * whichever half still means something.
 *
 * The literals are spelled out here instead of reusing `isLocale` from `i18n/`
 * because `services/storage` sits below that ring and may not import it — the
 * boundary is the point, and the duplication is two comparisons that `tsc`
 * checks against `AppPreferences` anyway.
 */
function parsePreferences(raw: unknown): AppPreferences | null {
  if (!isRecord(raw)) {
    return null
  }

  const defaults = createDefaultPreferences()

  return {
    locale: raw.locale === 'en' || raw.locale === 'es' ? raw.locale : defaults.locale,
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : defaults.theme,
  }
}

export function createLocalPreferencesRepository(): PreferencesRepository {
  return {
    get: async () =>
      read(STORAGE_KEYS.preferences, parsePreferences, createDefaultPreferences()),

    save: async (preferences) => {
      write(STORAGE_KEYS.preferences, preferences)
    },
  }
}
