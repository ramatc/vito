import type { DateKey, Habit, HabitCompletion } from '../../types/models'
import { addDays, eachDay } from '../shared/date'
import { dayOf, isScheduledOn } from './schedule'

/**
 * Per-habit history over a trailing window, for the stats heatmap.
 *
 * Deliberately per-habit rather than reusing `UserProgress`'s streak fields:
 * those are a single global counter across every habit, and answering "how is
 * THIS habit doing" needs the day-by-day detail a counter has already thrown
 * away.
 */

export type HabitDayStatus = 'completed' | 'missed' | 'rest' | 'pending'

export interface HabitHeatmapDay {
  date: DateKey
  status: HabitDayStatus
}

export interface HabitHeatmapStats {
  /** Oldest first, `today` last. */
  days: HabitHeatmapDay[]
  scheduledCount: number
  completedCount: number
}

export function habitHeatmap(
  habit: Habit,
  completions: readonly HabitCompletion[],
  today: DateKey,
  days: number,
): HabitHeatmapStats {
  const completedDays = new Set(
    completions.filter((completion) => completion.habitId === habit.id).map((c) => c.date),
  )

  let scheduledCount = 0
  let completedCount = 0

  const createdOn = dayOf(habit.createdAt)

  const heatmapDays = eachDay(addDays(today, -(days - 1)), today).map((date): HabitHeatmapDay => {
    // Before the habit existed there was nothing to miss — reads the same as
    // a rest day rather than fabricating history the user never had a chance
    // to act on.
    if (date < createdOn || !isScheduledOn(habit, date)) {
      return { date, status: 'rest' }
    }

    scheduledCount += 1

    if (completedDays.has(date)) {
      completedCount += 1
      return { date, status: 'completed' }
    }

    // Today's own scheduled-but-not-done slot is still open, not a miss.
    return { date, status: date === today ? 'pending' : 'missed' }
  })

  return { days: heatmapDays, scheduledCount, completedCount }
}
