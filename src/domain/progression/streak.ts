import type { DateKey } from '../../types/models'

export const STREAK = {
  /**
   * A streak resumed after a break starts at 1, not 0: the user did complete
   * something today, and rendering a zero would frame that as failure.
   */
  RESET_TO_ON_BREAK: 1,
} as const

export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActivityDate: DateKey | null
}

/**
 * Advances the streak for `today`.
 *
 * `missedScheduledDays` counts only fully-missed SCHEDULED days between the
 * last activity and today, so rest days are neutral — they neither extend nor
 * break a streak.
 *
 * Two distinct callers:
 * - completing a habit (`completedToday: true`) extends the streak, or restarts
 *   it at 1 if scheduled days were missed in between;
 * - the day rollover (`completedToday: false`) breaks a streak that ran into a
 *   missed scheduled day, leaving `lastActivityDate` alone because no activity
 *   happened.
 *
 * `longestStreak` is monotonic non-decreasing in both paths.
 */
export function updateStreak(
  state: StreakState,
  input: { today: DateKey; completedToday: boolean; missedScheduledDays: number },
): StreakState {
  if (!input.completedToday) {
    if (input.missedScheduledDays === 0) {
      return state
    }

    return { ...state, currentStreak: 0 }
  }

  // Already counted today. A streak measures days, not completions.
  if (state.lastActivityDate === input.today) {
    return state
  }

  const currentStreak =
    input.missedScheduledDays > 0 ? STREAK.RESET_TO_ON_BREAK : state.currentStreak + 1

  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastActivityDate: input.today,
  }
}
