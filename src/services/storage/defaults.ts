import { MOMENTUM } from '../../domain/progression/momentum'
import type {
  AppPreferences,
  DateKey,
  Locale,
  Theme,
  UserProgress,
  VitoState,
} from '../../types/models'

/**
 * First-run state — what a brand new profile looks like, and what a corrupt
 * save falls back to.
 *
 * These are factories, not shared constants. A single exported object would be
 * handed to every caller by reference, and one accidental mutation would
 * silently poison the defaults for the rest of the session.
 */

/**
 * A real `DateKey` that can never be today, meaning "no momentum has ever been
 * credited". The daily credit cap only ever compares this for equality against
 * the current day, so any date in the past reads as a spent-nothing budget.
 *
 * A valid date rather than an empty string because the type promises
 * `YYYY-MM-DD`, and the date helpers throw on anything else.
 */
export const NEVER_DATE_KEY: DateKey = '1970-01-01'

export function createDefaultUserProgress(): UserProgress {
  return {
    totalXp: 0,
    // Vito starts halfway up rather than empty: a new companion should look
    // alive on day one, and there is nothing to have lost yet.
    momentum: MOMENTUM.START,
    momentumCredit: { date: NEVER_DATE_KEY, amount: 0 },
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    lastRolloverDate: null,
    lastComebackDate: null,
    activeBoost: null,
  }
}

export function createDefaultVitoState(): VitoState {
  return { equippedItems: {}, unlockedItemIds: [] }
}

/**
 * Reads the browser's language once, and answers with a bucket the app ships.
 *
 * Prefix-matched rather than compared whole, because `navigator.language` is a
 * BCP 47 tag: `es`, `es-AR` and `es-419` are all the same bucket here, and a
 * user in Argentina should not land in English over a region subtag. Lowercased
 * first — the tag's case is not guaranteed by the spec, only conventional.
 */
function detectLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

/**
 * Reads the OS colour preference once.
 *
 * Guarded because `matchMedia` is not universal: jsdom omits it entirely, and
 * this function runs at module scope wherever a store declares its initial
 * state — an unguarded call would take down the whole test suite, not one
 * assertion. Light is the safe answer: it is what the app looked like before
 * dark mode existed.
 */
function detectTheme(): Theme {
  if (typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * First-run chrome, detected from the browser exactly once.
 *
 * "Once" is enforced by where this sits rather than by a flag: it is only ever
 * reached as the fallback for an absent or unusable saved value, so the moment
 * a choice is persisted, detection stops happening. That is what makes a manual
 * override in Settings survive a reload, and what keeps a later OS theme change
 * from silently overruling it.
 */
export function createDefaultPreferences(): AppPreferences {
  return { locale: detectLocale(), theme: detectTheme() }
}
