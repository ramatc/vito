import { describe, expect, it } from 'vitest'
import type { Habit, HabitCompletion } from '../../../types/models'
import { habitsWeeklyReport } from '../weeklyReport'

// 2026-03-09 is a Monday, so this week runs Mon..Sun.
const MONDAY = '2026-03-09'
const TUESDAY = '2026-03-10'
const WEDNESDAY = '2026-03-11'
const THURSDAY = '2026-03-12'
const FRIDAY = '2026-03-13'
const SATURDAY = '2026-03-14'
const SUNDAY = '2026-03-15'

// The Monday of the PRIOR week, used for the "future week" case.
const PRIOR_SUNDAY = '2026-03-08'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Read',
    icon: 'book',
    category: 'Mind',
    frequency: { type: 'daily' },
    difficulty: 'normal',
    createdAt: '2026-01-01T08:00:00.000Z',
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

function statusesFor(days: ReturnType<typeof habitsWeeklyReport>['rows'][number]['days']) {
  return days.map((day) => day.status)
}

describe('habitsWeeklyReport', () => {
  it('marks completed and missed days across a full week for a daily habit', () => {
    const habit = makeHabit()
    const completions = [
      makeCompletion({ date: MONDAY }),
      makeCompletion({ date: WEDNESDAY }),
      makeCompletion({ date: FRIDAY }),
    ]

    const report = habitsWeeklyReport([habit], completions, MONDAY, SUNDAY)

    expect(report.weekStart).toBe(MONDAY)
    expect(report.weekEnd).toBe(SUNDAY)
    expect(report.rows).toHaveLength(1)
    expect(report.rows[0].days.map((day) => day.date)).toEqual([
      MONDAY,
      TUESDAY,
      WEDNESDAY,
      THURSDAY,
      FRIDAY,
      SATURDAY,
      SUNDAY,
    ])
    expect(statusesFor(report.rows[0].days)).toEqual([
      'completed',
      'missed',
      'completed',
      'missed',
      'completed',
      'missed',
      'pending',
    ])
    expect(report.scheduledCount).toBe(7)
    expect(report.completedCount).toBe(3)
    expect(report.metPercent).toBe(43)
  })

  it('reads every day of a future week as rest, with metPercent at 0', () => {
    const habit = makeHabit()

    const report = habitsWeeklyReport([habit], [], MONDAY, PRIOR_SUNDAY)

    expect(statusesFor(report.rows[0].days)).toEqual([
      'rest',
      'rest',
      'rest',
      'rest',
      'rest',
      'rest',
      'rest',
    ])
    expect(report.scheduledCount).toBe(0)
    expect(report.completedCount).toBe(0)
    expect(report.metPercent).toBe(0)
    expect(report.bestWeekdayIndex).toBeNull()
  })

  it('reads scheduled days after today within the same week as rest, not missed', () => {
    const habit = makeHabit()

    const report = habitsWeeklyReport([habit], [], MONDAY, WEDNESDAY)

    expect(statusesFor(report.rows[0].days)).toEqual([
      'missed',
      'missed',
      'pending',
      'rest',
      'rest',
      'rest',
      'rest',
    ])
    expect(report.scheduledCount).toBe(3)
  })

  it('picks the weekday with the most completions across every row, ties going to the earlier index', () => {
    const habitA = makeHabit({ id: 'habit-a' })
    const habitB = makeHabit({ id: 'habit-b' })
    const completions = [
      // Wednesday (index 2) gets two completions total, the most of any day.
      makeCompletion({ habitId: 'habit-a', date: WEDNESDAY }),
      makeCompletion({ habitId: 'habit-b', date: WEDNESDAY }),
      // Monday (index 0) and Friday (index 4) tie at one each — Monday, being
      // earlier, must not be the winner here since Wednesday still leads.
      makeCompletion({ habitId: 'habit-a', date: MONDAY }),
      makeCompletion({ habitId: 'habit-b', date: FRIDAY }),
    ]

    const report = habitsWeeklyReport([habitA, habitB], completions, MONDAY, SUNDAY)

    expect(report.bestWeekdayIndex).toBe(2)
  })

  it('returns null for bestWeekdayIndex when nothing was completed', () => {
    const habit = makeHabit()

    const report = habitsWeeklyReport([habit], [], MONDAY, SUNDAY)

    expect(report.bestWeekdayIndex).toBeNull()
  })

  it('breaks a tie between two weekdays in favor of the earlier index', () => {
    const habit = makeHabit()
    const completions = [
      makeCompletion({ date: FRIDAY }),
      makeCompletion({ date: MONDAY }),
    ]

    const report = habitsWeeklyReport([habit], completions, MONDAY, SUNDAY)

    expect(report.bestWeekdayIndex).toBe(0)
  })

  it('marks off-days as rest for a weekdays habit, excluded from the counts', () => {
    const habit = makeHabit({ frequency: { type: 'weekdays', days: [1, 3, 5] } })

    const report = habitsWeeklyReport([habit], [], MONDAY, SUNDAY)

    expect(statusesFor(report.rows[0].days)).toEqual([
      'missed',
      'rest',
      'missed',
      'rest',
      'missed',
      'rest',
      'rest',
    ])
    expect(report.scheduledCount).toBe(3)
    expect(report.completedCount).toBe(0)
  })
})
