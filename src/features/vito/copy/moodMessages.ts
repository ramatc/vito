import type { Mood } from '../../../domain/vito/mood'
import type { TranslationKey } from '../../../i18n/keys'
import { t } from '../../../i18n/translate'
import type { Locale } from '../../../types/models'

/**
 * Every user-facing word Vito says, in one auditable file.
 *
 * `deriveMood` returns a semantic value and nothing else (design's copy ADR), so
 * this module is where the *choice* of copy is reviewed — the actual English
 * and Spanish sentences live in `i18n/en.ts` and `i18n/es.ts`, the one place a
 * translator touches. The rule this module still enforces: nothing here may
 * frame a quiet stretch as failure, punishment or disappointment. There is no
 * "you missed", no "broken streak", no "Vito is sad". The worst state the app
 * can reach is a nap.
 */

export interface MoodCopy {
  headline: string
  body: string
}

interface MoodCopyKeys {
  headlineKey: TranslationKey
  bodyKey: TranslationKey
}

const MOOD_COPY_KEYS: Record<Mood, MoodCopyKeys> = {
  thriving: { headlineKey: 'vito.mood.thriving.headline', bodyKey: 'vito.mood.thriving.body' },
  happy: { headlineKey: 'vito.mood.happy.headline', bodyKey: 'vito.mood.happy.body' },
  content: { headlineKey: 'vito.mood.content.headline', bodyKey: 'vito.mood.content.body' },
  sleepy: { headlineKey: 'vito.mood.sleepy.headline', bodyKey: 'vito.mood.sleepy.body' },
  resting: { headlineKey: 'vito.mood.resting.headline', bodyKey: 'vito.mood.resting.body' },
}

/** Beats the mood when today's whole list is done — the day's best news. */
const ALL_DONE_KEYS: MoodCopyKeys = {
  headlineKey: 'vito.mood.allDone.headline',
  bodyKey: 'vito.mood.allDone.body',
}

/** Beats everything: a comeback boost is on, so say so warmly. */
const COMEBACK_KEYS: MoodCopyKeys = {
  headlineKey: 'vito.mood.comeback.headline',
  bodyKey: 'vito.mood.comeback.body',
}

export interface MoodCopyInput {
  mood: Mood
  /** Today was scheduled and is fully done. */
  allDone: boolean
  /** A comeback boost still has completions on it. */
  boosted: boolean
}

function resolve(locale: Locale, keys: MoodCopyKeys): MoodCopy {
  return { headline: t(locale, keys.headlineKey), body: t(locale, keys.bodyKey) }
}

/**
 * The one line Vito says right now, in the caller's locale.
 *
 * Priority is deliberate: a live comeback boost is the most useful thing to
 * tell someone who just returned, finishing the day is the next, and the mood
 * carries every other moment.
 */
export function moodMessage(locale: Locale, input: MoodCopyInput): MoodCopy {
  if (input.boosted) {
    return resolve(locale, COMEBACK_KEYS)
  }

  if (input.allDone) {
    return resolve(locale, ALL_DONE_KEYS)
  }

  return resolve(locale, MOOD_COPY_KEYS[input.mood])
}

const MOOD_ALT_KEYS: Record<Mood, TranslationKey> = {
  thriving: 'vito.mood.thriving.alt',
  happy: 'vito.mood.happy.alt',
  content: 'vito.mood.content.alt',
  sleepy: 'vito.mood.sleepy.alt',
  resting: 'vito.mood.resting.alt',
}

/**
 * Alt text for the avatar, so the drawing is not silent to a screen reader.
 * Same rule as the copy above: describe a state, never a verdict.
 */
export function moodAltText(locale: Locale, mood: Mood): string {
  return t(locale, MOOD_ALT_KEYS[mood])
}
