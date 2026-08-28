import type { ReactNode } from 'react'
import type { Habit } from '../../types/models'
import { HabitCard } from './HabitCard'

/**
 * A list of habits with an empty state. Presentational — both the "today" view
 * and the full habit manager render through this.
 */

export interface HabitListProps {
  habits: readonly Habit[]
  completedHabitIds: readonly string[]
  onToggle(habitId: string): void
  onEdit?(habit: Habit): void
  onArchive?(habit: Habit): void
  /** Shown instead of the list when there is nothing to render. */
  empty: ReactNode
  busyHabitIds?: readonly string[]
}

export function HabitList({
  habits,
  completedHabitIds,
  onToggle,
  onEdit,
  onArchive,
  empty,
  busyHabitIds = [],
}: HabitListProps) {
  if (habits.length === 0) {
    return <>{empty}</>
  }

  const completed = new Set(completedHabitIds)
  const busy = new Set(busyHabitIds)

  return (
    <ul className="flex flex-col gap-2">
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitCard
            habit={habit}
            completed={completed.has(habit.id)}
            disabled={busy.has(habit.id)}
            onToggle={onToggle}
            onEdit={onEdit}
            onArchive={onArchive}
          />
        </li>
      ))}
    </ul>
  )
}
