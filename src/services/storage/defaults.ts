import { MOMENTUM } from '../../domain/progression/momentum'
import type { DateKey, UserProgress, VitoState } from '../../types/models'

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
