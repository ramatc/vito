import { describe, expect, it } from 'vitest'
import type { StreakState } from './streak'
import { STREAK, updateStreak } from './streak'

const MONDAY = '2026-03-09'
const TUESDAY = '2026-03-10'
const WEDNESDAY = '2026-03-11'

function makeState(overrides: Partial<StreakState> = {}): StreakState {
  return {
    currentStreak: 5,
    longestStreak: 9,
    lastActivityDate: MONDAY,
    ...overrides,
  }
}

describe('completing a habit today', () => {
  it('extends the streak on the next day', () => {
    expect(
      updateStreak(makeState(), {
        today: TUESDAY,
        completedToday: true,
        missedScheduledDays: 0,
      }),
    ).toEqual({ currentStreak: 6, longestStreak: 9, lastActivityDate: TUESDAY })
  })

  it('starts a streak at 1 for a first-ever completion', () => {
    expect(
      updateStreak(
        makeState({ currentStreak: 0, longestStreak: 0, lastActivityDate: null }),
        { today: MONDAY, completedToday: true, missedScheduledDays: 0 },
      ),
    ).toEqual({ currentStreak: 1, longestStreak: 1, lastActivityDate: MONDAY })
  })

  it('increments at most once per calendar day', () => {
    const afterFirst = updateStreak(makeState(), {
      today: TUESDAY,
      completedToday: true,
      missedScheduledDays: 0,
    })
    const afterSecond = updateStreak(afterFirst, {
      today: TUESDAY,
      completedToday: true,
      missedScheduledDays: 0,
    })

    expect(afterSecond).toEqual(afterFirst)
  })

  it('survives a rest day, because no scheduled day was missed', () => {
    // Monday -> Wednesday with Tuesday scheduled for nothing: the caller passes
    // missedScheduledDays 0, so the gap is neutral rather than a break.
    expect(
      updateStreak(makeState(), {
        today: WEDNESDAY,
        completedToday: true,
        missedScheduledDays: 0,
      }),
    ).toEqual({ currentStreak: 6, longestStreak: 9, lastActivityDate: WEDNESDAY })
  })

  it('resets a broken streak to 1, not 0, so the UI never renders a zero', () => {
    expect(
      updateStreak(makeState(), {
        today: WEDNESDAY,
        completedToday: true,
        missedScheduledDays: 1,
      }),
    ).toEqual({
      currentStreak: STREAK.RESET_TO_ON_BREAK,
      longestStreak: 9,
      lastActivityDate: WEDNESDAY,
    })
  })

  it('raises the longest streak once the current one passes it', () => {
    expect(
      updateStreak(makeState({ currentStreak: 9, longestStreak: 9 }), {
        today: TUESDAY,
        completedToday: true,
        missedScheduledDays: 0,
      }),
    ).toEqual({ currentStreak: 10, longestStreak: 10, lastActivityDate: TUESDAY })
  })
})

describe('a day that ends without a completion', () => {
  it('breaks the current streak when a scheduled day was missed', () => {
    expect(
      updateStreak(makeState(), {
        today: TUESDAY,
        completedToday: false,
        missedScheduledDays: 1,
      }),
    ).toEqual({ currentStreak: 0, longestStreak: 9, lastActivityDate: MONDAY })
  })

  it('leaves the streak untouched when the missed days were all rest days', () => {
    expect(
      updateStreak(makeState(), {
        today: TUESDAY,
        completedToday: false,
        missedScheduledDays: 0,
      }),
    ).toEqual(makeState())
  })

  it('never lowers the longest streak when the current one breaks', () => {
    const broken = updateStreak(makeState({ currentStreak: 9, longestStreak: 9 }), {
      today: TUESDAY,
      completedToday: false,
      missedScheduledDays: 2,
    })

    expect(broken.currentStreak).toBe(0)
    expect(broken.longestStreak).toBe(9)
  })
})

describe('longestStreak over a full history', () => {
  it('is monotonic non-decreasing across a run, a break and a rebuild', () => {
    const history: Array<{ completedToday: boolean; missedScheduledDays: number }> = [
      { completedToday: true, missedScheduledDays: 0 },
      { completedToday: true, missedScheduledDays: 0 },
      { completedToday: true, missedScheduledDays: 0 },
      { completedToday: false, missedScheduledDays: 1 },
      { completedToday: false, missedScheduledDays: 1 },
      { completedToday: true, missedScheduledDays: 2 },
      { completedToday: true, missedScheduledDays: 0 },
      { completedToday: true, missedScheduledDays: 0 },
      { completedToday: true, missedScheduledDays: 0 },
    ]

    let state: StreakState = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
    }
    const longestOverTime: number[] = []

    history.forEach((day, index) => {
      const today = `2026-03-${String(index + 1).padStart(2, '0')}`
      state = updateStreak(state, { today, ...day })
      longestOverTime.push(state.longestStreak)
    })

    expect(longestOverTime).toEqual([1, 2, 3, 3, 3, 3, 3, 3, 4])
    for (let i = 1; i < longestOverTime.length; i += 1) {
      expect(longestOverTime[i]).toBeGreaterThanOrEqual(longestOverTime[i - 1])
    }
    expect(state.currentStreak).toBe(4)
  })
})
