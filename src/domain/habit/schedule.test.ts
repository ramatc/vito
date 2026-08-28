import { describe, expect, it } from 'vitest'
import type { Habit, HabitCompletion } from '../../types/models'
import {
  countMissedScheduledDays,
  habitsScheduledOn,
  isRestDay,
  isScheduledOn,
} from './schedule'

// 2026-03-08 is a Sunday, so the week below runs Sun(0) .. Sat(6).
const SUNDAY = '2026-03-08'
const MONDAY = '2026-03-09'
const TUESDAY = '2026-03-10'
const WEDNESDAY = '2026-03-11'
const THURSDAY = '2026-03-12'
const FRIDAY = '2026-03-13'
const SATURDAY = '2026-03-14'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Read',
    icon: 'book',
    category: 'Mind',
    frequency: { type: 'daily' },
    difficulty: 'normal',
    createdAt: '2026-03-01T08:00:00.000Z',
    ...overrides,
  }
}

function makeCompletion(overrides: Partial<HabitCompletion> = {}): HabitCompletion {
  return {
    id: 'completion-1',
    habitId: 'habit-1',
    date: MONDAY,
    xpAwarded: 20,
    completedAt: `${MONDAY}T09:00:00.000Z`,
    ...overrides,
  }
}

describe('isScheduledOn', () => {
  it('schedules a daily habit on every day of the week', () => {
    const habit = makeHabit()

    for (const day of [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY]) {
      expect(isScheduledOn(habit, day)).toBe(true)
    }
  })

  it('schedules a weekday habit only on its selected days', () => {
    const habit = makeHabit({ frequency: { type: 'weekdays', days: [1, 3, 5] } })

    expect(isScheduledOn(habit, MONDAY)).toBe(true)
    expect(isScheduledOn(habit, WEDNESDAY)).toBe(true)
    expect(isScheduledOn(habit, FRIDAY)).toBe(true)
    expect(isScheduledOn(habit, TUESDAY)).toBe(false)
    expect(isScheduledOn(habit, SUNDAY)).toBe(false)
  })

  it('schedules a Sunday-only habit on day 0', () => {
    const habit = makeHabit({ frequency: { type: 'weekdays', days: [0] } })

    expect(isScheduledOn(habit, SUNDAY)).toBe(true)
    expect(isScheduledOn(habit, MONDAY)).toBe(false)
  })

  it('stops scheduling a habit from its archival day onward', () => {
    const habit = makeHabit({ archivedAt: `${WEDNESDAY}T10:00:00.000Z` })

    expect(isScheduledOn(habit, WEDNESDAY)).toBe(false)
    expect(isScheduledOn(habit, THURSDAY)).toBe(false)
  })

  it('keeps a habit scheduled on days before it was archived, preserving history', () => {
    const habit = makeHabit({ archivedAt: `${WEDNESDAY}T10:00:00.000Z` })

    expect(isScheduledOn(habit, MONDAY)).toBe(true)
    expect(isScheduledOn(habit, TUESDAY)).toBe(true)
  })
})

describe('habitsScheduledOn', () => {
  it('returns only the habits due on that day', () => {
    const daily = makeHabit({ id: 'daily' })
    const midweek = makeHabit({
      id: 'midweek',
      frequency: { type: 'weekdays', days: [1, 3, 5] },
    })
    const weekend = makeHabit({
      id: 'weekend',
      frequency: { type: 'weekdays', days: [0, 6] },
    })

    expect(habitsScheduledOn([daily, midweek, weekend], MONDAY).map((h) => h.id)).toEqual(
      ['daily', 'midweek'],
    )
    expect(habitsScheduledOn([daily, midweek, weekend], SUNDAY).map((h) => h.id)).toEqual(
      ['daily', 'weekend'],
    )
  })

  it('excludes archived habits', () => {
    const active = makeHabit({ id: 'active' })
    const archived = makeHabit({ id: 'archived', archivedAt: `${MONDAY}T07:00:00.000Z` })

    expect(habitsScheduledOn([active, archived], MONDAY).map((h) => h.id)).toEqual([
      'active',
    ])
  })
})

describe('isRestDay', () => {
  it('is a rest day when nothing is scheduled', () => {
    const midweek = makeHabit({ frequency: { type: 'weekdays', days: [1, 3, 5] } })

    expect(isRestDay([midweek], TUESDAY)).toBe(true)
  })

  it('is not a rest day when at least one habit is scheduled', () => {
    const midweek = makeHabit({ frequency: { type: 'weekdays', days: [1, 3, 5] } })

    expect(isRestDay([midweek], MONDAY)).toBe(false)
  })

  it('treats a user with no habits at all as resting', () => {
    expect(isRestDay([], MONDAY)).toBe(true)
  })

  it('is a rest day once the only habit has been archived', () => {
    const archived = makeHabit({ archivedAt: `${MONDAY}T07:00:00.000Z` })

    expect(isRestDay([archived], MONDAY)).toBe(true)
  })
})

describe('countMissedScheduledDays', () => {
  const midweek = makeHabit({ frequency: { type: 'weekdays', days: [1, 3, 5] } })

  it('counts every fully-missed scheduled day in an exclusive window', () => {
    // Window is exclusive on both ends: Mon, Tue, Wed, Thu, Fri are evaluated.
    // Only Mon/Wed/Fri are scheduled, and none was completed.
    expect(
      countMissedScheduledDays({
        habits: [midweek],
        completions: [],
        from: SUNDAY,
        to: SATURDAY,
      }),
    ).toBe(3)
  })

  it('does not count rest days, so a daily-habit-free day is neutral', () => {
    // Tue and Thu fall inside the window but are not scheduled — if they were
    // counted the answer above would be 5, not 3.
    expect(
      countMissedScheduledDays({
        habits: [midweek],
        completions: [],
        from: TUESDAY,
        to: THURSDAY,
      }),
    ).toBe(1)
  })

  it('treats a day with at least one completion as partial, not missed', () => {
    expect(
      countMissedScheduledDays({
        habits: [midweek],
        completions: [makeCompletion({ date: WEDNESDAY })],
        from: SUNDAY,
        to: SATURDAY,
      }),
    ).toBe(2)
  })

  it('ignores completions that fall outside the window', () => {
    expect(
      countMissedScheduledDays({
        habits: [midweek],
        completions: [makeCompletion({ date: SATURDAY })],
        from: SUNDAY,
        to: SATURDAY,
      }),
    ).toBe(3)
  })

  it('never manufactures missed days after a habit is archived', () => {
    const archived = makeHabit({
      frequency: { type: 'weekdays', days: [1, 3, 5] },
      archivedAt: `${WEDNESDAY}T10:00:00.000Z`,
    })

    // Only Monday remains scheduled; Wed and Fri fall on or after archival.
    expect(
      countMissedScheduledDays({
        habits: [archived],
        completions: [],
        from: SUNDAY,
        to: SATURDAY,
      }),
    ).toBe(1)
  })

  it('returns 0 for adjacent days, because the window excludes both ends', () => {
    // Nothing sits strictly between Monday and Tuesday — the emptiness comes
    // from the exclusive window, and the wider windows above return non-zero.
    expect(
      countMissedScheduledDays({
        habits: [midweek],
        completions: [],
        from: MONDAY,
        to: TUESDAY,
      }),
    ).toBe(0)
  })

  it('returns 0 for an inverted window', () => {
    expect(
      countMissedScheduledDays({
        habits: [midweek],
        completions: [],
        from: SATURDAY,
        to: SUNDAY,
      }),
    ).toBe(0)
  })
})
