import type { DateKey, Habit, HabitCompletion } from '../../types/models'
import { addDays, daysBetween, eachDay, weekdayOf } from '../shared/date'

/**
 * Which habits are due on a given day, and how many whole days were fully
 * missed. Everything here is a pure function of the day passed in — nothing
 * reads the clock.
 */

/** The calendar day of an ISO timestamp, i.e. its leading `YYYY-MM-DD`. */
function dayOf(isoTimestamp: string): DateKey {
  return isoTimestamp.slice(0, 10)
}

/**
 * Is this habit due on `date`?
 *
 * An archived habit stops being due from its archival day onward. Earlier days
 * still count it, so archiving never rewrites history — and it never
 * retroactively manufactures a missed day either.
 */
export function isScheduledOn(habit: Habit, date: DateKey): boolean {
  if (habit.archivedAt !== undefined && date >= dayOf(habit.archivedAt)) {
    return false
  }

  if (habit.frequency.type === 'daily') {
    return true
  }

  return habit.frequency.days.includes(weekdayOf(date))
}

/** The habits due on `date`, in their original order. */
export function habitsScheduledOn(habits: Habit[], date: DateKey): Habit[] {
  return habits.filter((habit) => isScheduledOn(habit, date))
}

/**
 * A day with nothing scheduled. Rest days are strictly neutral: they neither
 * extend nor break a streak, and they never debit momentum.
 */
export function isRestDay(habits: Habit[], date: DateKey): boolean {
  return habitsScheduledOn(habits, date).length === 0
}

/**
 * Fully-missed scheduled days strictly between `from` and `to` (both excluded).
 *
 * A day counts only when something was scheduled AND nothing at all was
 * completed. A day with at least one completion is partial and costs nothing —
 * the forgiving mechanic the product is built on.
 */
export function countMissedScheduledDays(input: {
  habits: Habit[]
  completions: HabitCompletion[]
  from: DateKey
  to: DateKey
}): number {
  const { habits, completions, from, to } = input

  if (daysBetween(from, to) < 2) {
    return 0
  }

  const completedDays = new Set(completions.map((completion) => completion.date))

  return eachDay(addDays(from, 1), addDays(to, -1)).filter(
    (day) => !isRestDay(habits, day) && !completedDays.has(day),
  ).length
}
