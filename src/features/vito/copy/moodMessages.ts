import type { Mood } from '../../../domain/vito/mood'

/**
 * Every user-facing word Vito says, in one auditable file.
 *
 * `deriveMood` returns a semantic value and nothing else (design's copy ADR), so
 * this module is where the product's voice is reviewed. The rule it exists to
 * enforce: nothing here may frame a quiet stretch as failure, punishment or
 * disappointment. There is no "you missed", no "broken streak", no "Vito is
 * sad". The worst state the app can reach is a nap.
 */

export interface MoodCopy {
  headline: string
  body: string
}

export const MOOD_MESSAGES: Record<Mood, MoodCopy> = {
  thriving: {
    headline: 'Vito is glowing',
    body: 'Everything lined up today. Enjoy how that feels.',
  },
  happy: {
    headline: 'Vito is happy',
    body: 'You showed up. That is the entire trick, repeated.',
  },
  content: {
    headline: 'Vito is settled',
    body: 'Nothing urgent here. Pick one habit whenever you are ready.',
  },
  sleepy: {
    headline: 'Vito is dozing',
    body: 'Things have been quiet. One small habit is enough to stir him.',
  },
  resting: {
    headline: 'Vito is resting',
    body: 'He has been taking it easy, and he is ready whenever you are.',
  },
}

/** Beats the mood when today's whole list is done — the day's best news. */
export const ALL_DONE_MESSAGE: MoodCopy = {
  headline: 'Vito is delighted',
  body: 'That is everything scheduled for today. The rest of it is yours.',
}

/** Beats everything: a comeback boost is on, so say so warmly. */
export const COMEBACK_MESSAGE: MoodCopy = {
  headline: 'Vito is glad you are back',
  body: 'Your next few habits are worth extra XP. No catching up required.',
}

export interface MoodCopyInput {
  mood: Mood
  /** Today was scheduled and is fully done. */
  allDone: boolean
  /** A comeback boost still has completions on it. */
  boosted: boolean
}

/**
 * The one line Vito says right now.
 *
 * Priority is deliberate: a live comeback boost is the most useful thing to
 * tell someone who just returned, finishing the day is the next, and the mood
 * carries every other moment.
 */
export function moodMessage({ mood, allDone, boosted }: MoodCopyInput): MoodCopy {
  if (boosted) {
    return COMEBACK_MESSAGE
  }

  if (allDone) {
    return ALL_DONE_MESSAGE
  }

  return MOOD_MESSAGES[mood]
}

/**
 * Alt text for the avatar, so the drawing is not silent to a screen reader.
 * Same rule as the copy above: describe a state, never a verdict.
 */
export const MOOD_ALT_TEXT: Record<Mood, string> = {
  thriving: 'beaming',
  happy: 'smiling',
  content: 'calm',
  sleepy: 'dozing',
  resting: 'resting with his eyes closed',
}
