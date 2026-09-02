import { create } from 'zustand'
import { createDefaultPreferences } from '../services/storage/defaults'
import type { AppPreferences, Locale, Theme } from '../types/models'
import type { StoreStatus } from './progressStore'
import { getRepositories } from './repositories'

/**
 * The app's chrome: which language it speaks and which theme it wears.
 *
 * A store rather than a React context, which is what keeps `components/`
 * props-only. Everything above it — `features/`, `hooks/`, `app/` — subscribes
 * here and resolves its own strings; the presentational ring receives strings
 * it never had to look up.
 *
 * There is deliberately no `reset()`. Every other persisted store has one, and
 * `resetAllData` calls each of them, so an absent method is not an oversight —
 * it is the enforcement. "Start over" cannot reach preferences even by
 * accident, because there is nothing here for it to call and a caller that
 * tries does not compile.
 */
export interface PreferencesStore {
  preferences: AppPreferences
  status: StoreStatus
  load(): Promise<void>
  setLocale(locale: Locale): Promise<void>
  setTheme(theme: Theme): Promise<void>
}

export const usePreferencesStore = create<PreferencesStore>()((set, get) => {
  async function persist(preferences: AppPreferences): Promise<void> {
    set({ preferences })
    await getRepositories().preferences.save(preferences)
  }

  return {
    // Detected, not empty. This value is on screen for the one frame between
    // module evaluation and `load()` resolving, and a user whose OS is dark
    // should not see a white flash in that frame.
    preferences: createDefaultPreferences(),
    status: 'idle',

    load: async () => {
      set({ status: 'loading' })
      set({ preferences: await getRepositories().preferences.get(), status: 'ready' })
    },

    // Both setters spread the current pair rather than writing a fresh object:
    // the two settings come from two separate controls, and replacing the whole
    // value would quietly undo whichever one was touched first.
    setLocale: async (locale) => {
      await persist({ ...get().preferences, locale })
    },

    setTheme: async (theme) => {
      await persist({ ...get().preferences, theme })
    },
  }
})
