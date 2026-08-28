import { COMEBACK } from '../progression/comeback'

/**
 * Vito's mood, as data only.
 *
 * There is deliberately no copy in this module. `deriveMood` returns a semantic
 * value and the presentation layer owns every user-facing string, which is what
 * keeps the "never sounds like failure" rule reviewable in one place — and what
 * keeps this ring portable.
 *
 * Note what is missing from the union: there is no dead, broken or failed mood.
 * The worst reachable state is `sleepy`, and a rest day cannot even reach that.
 */
export type Mood = 'thriving' | 'happy' | 'content' | 'sleepy' | 'resting'

export interface MoodInput {
  /** 0..100. */
  momentum: number
  /** completed / scheduled today, 0..1. */
  todayCompletionRatio: number
  daysSinceLastActivity: number
  /** Nothing scheduled today, so the completion ratio must not be held against the user. */
  isRestDay: boolean
}

export const MOOD_THRESHOLDS = {
  /** Shared with the comeback trigger: one quiet stretch, one definition. */
  RESTING_DAYS: COMEBACK.INACTIVITY_TRIGGER_DAYS,
  THRIVING_MOMENTUM: 80,
  THRIVING_COMPLETION_RATIO: 1,
  HAPPY_MOMENTUM: 65,
  SLEEPY_MOMENTUM: 25,
} as const

/**
 * Ordered by priority — the first match wins, and the order is part of the
 * contract, not an implementation detail. `resting` sits first so a long
 * absence is always framed as rest rather than as a low score.
 */
export const MOOD_RULES: ReadonlyArray<{
  mood: Mood
  when: (input: MoodInput) => boolean
}> = [
  {
    mood: 'resting',
    when: (i) => i.daysSinceLastActivity >= MOOD_THRESHOLDS.RESTING_DAYS,
  },
  {
    mood: 'thriving',
    when: (i) =>
      i.momentum >= MOOD_THRESHOLDS.THRIVING_MOMENTUM &&
      i.todayCompletionRatio >= MOOD_THRESHOLDS.THRIVING_COMPLETION_RATIO,
  },
  {
    mood: 'happy',
    when: (i) =>
      i.todayCompletionRatio > 0 || i.momentum >= MOOD_THRESHOLDS.HAPPY_MOMENTUM,
  },
  {
    // A rest day can never be sleepy: nothing was scheduled, so there is
    // nothing to be behind on.
    mood: 'sleepy',
    when: (i) => i.momentum < MOOD_THRESHOLDS.SLEEPY_MOMENTUM && !i.isRestDay,
  },
]

/** The first matching rule's mood, or `content` when nothing stands out. */
export function deriveMood(input: MoodInput): Mood {
  return MOOD_RULES.find((rule) => rule.when(input))?.mood ?? 'content'
}
