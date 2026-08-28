import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { useCompleteHabit } from '../../hooks/useCompleteHabit'
import { useTodayHabits } from '../../hooks/useTodayHabits'
import { HabitList } from './HabitList'

/**
 * Today's habits as a section, not a screen — Phase 7 embeds this under the
 * Vito hero and the progress bars, so it deliberately owns no page chrome.
 *
 * Every empty-ish state here is framed as neutral or restful. A day with
 * nothing scheduled is a rest day, not a miss.
 */
export function TodayHabits() {
  const { habits, completedHabitIds, completedCount, scheduledCount, allDone, restDay } =
    useTodayHabits()
  const { complete, undo } = useCompleteHabit()

  const onToggle = (habitId: string) => {
    if (completedHabitIds.includes(habitId)) {
      void undo(habitId)

      return
    }

    void complete(habitId)
  }

  return (
    <section className="flex flex-col gap-3" aria-label="Today's habits">
      {scheduledCount > 0 && (
        <p className="text-sm text-slate-500">
          {completedCount} of {scheduledCount} done today
        </p>
      )}

      {allDone && (
        <Card className="bg-emerald-50 text-sm text-emerald-800 ring-emerald-200">
          That is everything for today. Vito is delighted.
        </Card>
      )}

      <HabitList
        habits={habits}
        completedHabitIds={completedHabitIds}
        onToggle={onToggle}
        empty={
          <Card className="flex flex-col items-start gap-2 text-sm text-slate-600">
            {restDay ? (
              <>
                <span className="font-medium text-slate-900">
                  Nothing scheduled today
                </span>
                <span>Vito is taking it easy. Ready whenever you are.</span>
              </>
            ) : (
              <>
                <span className="font-medium text-slate-900">No habits yet</span>
                <span>Add your first one and Vito will start growing with you.</span>
              </>
            )}
            <Link
              to="/habits"
              className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Go to habits
            </Link>
          </Card>
        }
      />
    </section>
  )
}
