import { describe, expect, it } from 'vitest'
import type { Habit, HabitCompletion } from '../../../types/models'
import { habitHeatmap } from '../heatmap'

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

function statusesFor(days: ReturnType<typeof habitHeatmap>['days']): string[] {
  return days.map((day) => day.status)
}

describe('habitHeatmap', () => {
  it('marks completed and missed days for a daily habit', () => {
    const habit = makeHabit()
    const completions = [makeCompletion({ date: MONDAY }), makeCompletion({ date: WEDNESDAY })]

    const stats = habitHeatmap(habit, completions, FRIDAY, 5)

    expect(stats.days.map((day) => day.date)).toEqual([
      MONDAY,
      TUESDAY,
      WEDNESDAY,
      THURSDAY,
      FRIDAY,
    ])
    expect(statusesFor(stats.days)).toEqual([
      'completed',
      'missed',
      'completed',
      'missed',
      'pending',
    ])
    expect(stats.scheduledCount).toBe(5)
    expect(stats.completedCount).toBe(2)
  })

  it('reads today as pending rather than missed when not yet completed', () => {
    const habit = makeHabit()

    const stats = habitHeatmap(habit, [], FRIDAY, 1)

    expect(statusesFor(stats.days)).toEqual(['pending'])
    expect(stats.scheduledCount).toBe(1)
    expect(stats.completedCount).toBe(0)
  })

  it('marks off-days as rest for a weekdays habit, excluded from scheduledCount', () => {
    const habit = makeHabit({ frequency: { type: 'weekdays', days: [1, 3, 5] } })

    const stats = habitHeatmap(habit, [], SATURDAY, 7)

    expect(stats.days.map((day) => day.date)).toEqual([
      SUNDAY,
      MONDAY,
      TUESDAY,
      WEDNESDAY,
      THURSDAY,
      FRIDAY,
      SATURDAY,
    ])
    expect(statusesFor(stats.days)).toEqual([
      'rest',
      'missed',
      'rest',
      'missed',
      'rest',
      'missed',
      'rest',
    ])
    expect(stats.scheduledCount).toBe(3)
    expect(stats.completedCount).toBe(0)
  })

  it('reads days on or after archival as rest, never manufacturing a miss', () => {
    const habit = makeHabit({ archivedAt: `${WEDNESDAY}T10:00:00.000Z` })

    const stats = habitHeatmap(habit, [], FRIDAY, 5)

    expect(statusesFor(stats.days)).toEqual([
      'missed',
      'missed',
      'rest',
      'rest',
      'rest',
    ])
    expect(stats.scheduledCount).toBe(2)
  })

  it('reads days before the habit was created as rest, never a fabricated miss', () => {
    const habit = makeHabit({ createdAt: `${THURSDAY}T08:00:00.000Z` })

    const stats = habitHeatmap(habit, [], FRIDAY, 5)

    expect(statusesFor(stats.days)).toEqual(['rest', 'rest', 'rest', 'missed', 'pending'])
    expect(stats.scheduledCount).toBe(2)
  })
})
