import type { DateKey, Habit, HabitCompletion } from '../../types/models'
import { addDays, eachDay } from '../shared/date'
import type { HabitHeatmapDay } from './heatmap'
import { dayOf, isScheduledOn } from './schedule'

/**
 * The all-habits weekly report: one row per active habit over a Monday-first
 * week, plus the aggregate numbers the footer stats bar needs.
 *
 * Reuses `HabitHeatmapDay`'s status rules (`heatmap.ts`) rather than inventing
 * a parallel status type, with one addition `heatmap.ts` never needed: a
 * scheduled day that has not happened yet — a future day inside the displayed
 * week — reads as `rest`, the same as a day before the habit existed. Without
 * that rule, navigating to the current week would render tomorrow as an
 * already-missed day.
 */

export interface HabitWeekRow {
  habit: Habit
  days: HabitHeatmapDay[] // exactly 7, weekStart..weekStart+6
}

export interface HabitsWeeklyReport {
  weekStart: DateKey
  weekEnd: DateKey
  rows: HabitWeekRow[]
  scheduledCount: number
  completedCount: number
  /** 0 when scheduledCount is 0. Rounded to the nearest integer. */
  metPercent: number
  /** Monday-first index (0=Mon..6=Sun) of the weekday with the most completions this week, or null when nothing was completed. Ties go to the earliest index. */
  bestWeekdayIndex: number | null
}

export function habitsWeeklyReport(
  habits: readonly Habit[],
  completions: readonly HabitCompletion[],
  weekStart: DateKey,
  today: DateKey,
): HabitsWeeklyReport {
  const weekEnd = addDays(weekStart, 6)
  const weekDates = eachDay(weekStart, weekEnd)

  let scheduledCount = 0
  let completedCount = 0
  const completionsByWeekday = new Array<number>(7).fill(0)

  const rows: HabitWeekRow[] = habits.map((habit) => {
    const completedDays = new Set(
      completions.filter((completion) => completion.habitId === habit.id).map((c) => c.date),
    )
    const createdOn = dayOf(habit.createdAt)

    const days = weekDates.map((date, weekdayIndex): HabitHeatmapDay => {
      // Same "nothing to miss" logic as `habitHeatmap`, plus a day that has not
      // arrived yet — that scheduled slot is not open for completion at all,
      // let alone missed.
      if (date < createdOn || date > today || !isScheduledOn(habit, date)) {
        return { date, status: 'rest' }
      }

      scheduledCount += 1

      if (completedDays.has(date)) {
        completedCount += 1
        completionsByWeekday[weekdayIndex] += 1
        return { date, status: 'completed' }
      }

      return { date, status: date === today ? 'pending' : 'missed' }
    })

    return { habit, days }
  })

  const metPercent =
    scheduledCount === 0 ? 0 : Math.round((completedCount / scheduledCount) * 100)

  let bestWeekdayIndex: number | null = null
  let bestCount = 0

  for (let weekdayIndex = 0; weekdayIndex < completionsByWeekday.length; weekdayIndex += 1) {
    // Strictly greater than: ties keep the earliest index already recorded.
    if (completionsByWeekday[weekdayIndex] > bestCount) {
      bestCount = completionsByWeekday[weekdayIndex]
      bestWeekdayIndex = weekdayIndex
    }
  }

  return {
    weekStart,
    weekEnd,
    rows,
    scheduledCount,
    completedCount,
    metPercent,
    bestWeekdayIndex,
  }
}
