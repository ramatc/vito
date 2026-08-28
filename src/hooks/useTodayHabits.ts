import { useMemo } from 'react'
import { habitsScheduledOn, isRestDay } from '../domain/habit/schedule'
import { todayKey } from '../domain/shared/date'
import { useHabitStore } from '../stores/habitStore'
import type { DateKey, Habit } from '../types/models'

/**
 * Today's list, derived from the habit store.
 *
 * `hooks/` is the one ring allowed to call domain functions from the UI side
 * (design §6), which is why the scheduling question is answered here once
 * instead of in every component that needs it.
 */

export interface TodayHabits {
  today: DateKey
  /** Habits due today, archived ones already excluded by the domain. */
  habits: Habit[]
  completedHabitIds: string[]
  completedCount: number
  scheduledCount: number
  /** True only when something was scheduled and all of it is done. */
  allDone: boolean
  /** Nothing scheduled. Neutral by design — never rendered as a miss. */
  restDay: boolean
  isLoading: boolean
}

export function useTodayHabits(today: DateKey = todayKey()): TodayHabits {
  const habits = useHabitStore((state) => state.habits)
  const completions = useHabitStore((state) => state.completions)
  const status = useHabitStore((state) => state.status)

  return useMemo(() => {
    const scheduled = habitsScheduledOn(habits, today)
    const scheduledIds = new Set(scheduled.map((habit) => habit.id))
    const completedHabitIds = completions
      .filter(
        (completion) => completion.date === today && scheduledIds.has(completion.habitId),
      )
      .map((completion) => completion.habitId)

    return {
      today,
      habits: scheduled,
      completedHabitIds,
      completedCount: completedHabitIds.length,
      scheduledCount: scheduled.length,
      allDone: scheduled.length > 0 && completedHabitIds.length === scheduled.length,
      restDay: isRestDay(habits, today),
      isLoading: status !== 'ready',
    }
  }, [habits, completions, status, today])
}
