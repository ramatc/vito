import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { useCompleteHabit } from '../../hooks/useCompleteHabit'
import { useTodayHabits } from '../../hooks/useTodayHabits'
import { useTranslate } from '../../hooks/useTranslate'
import { HabitList } from './HabitList'

/**
 * Today's habits as a section, not a screen — Phase 7 embeds this under the
 * Vito hero and the progress bars, so it deliberately owns no page chrome.
 *
 * Every empty-ish state here is framed as neutral or restful. A day with
 * nothing scheduled is a rest day, not a miss.
 */
export function TodayHabits() {
  const { habits, completedHabitIds, completedCount, scheduledCount, restDay } = useTodayHabits()
  const { toggle, pendingHabitIds, lastGain } = useCompleteHabit()
  const t = useTranslate()

  const onToggle = (habitId: string) => {
    toggle(habitId, completedHabitIds.includes(habitId))
  }

  return (
    <section className="flex flex-col gap-3" aria-label={t('habits.today.label')}>
      {scheduledCount > 0 && (
        <p className="text-sm text-slate-500 dark:text-muted">
          {t('habits.today.progress', {
            completed: completedCount,
            scheduled: scheduledCount,
          })}
        </p>
      )}

      <HabitList
        habits={habits}
        completedHabitIds={completedHabitIds}
        onToggle={onToggle}
        busyHabitIds={pendingHabitIds}
        lastGain={lastGain}
        empty={
          <Card className="flex flex-col items-start gap-2 text-sm text-slate-600 dark:text-muted">
            {restDay ? (
              <>
                <span className="font-medium text-slate-900 dark:text-primary">
                  {t('habits.today.restTitle')}
                </span>
                <span>{t('habits.today.restDescription')}</span>
              </>
            ) : (
              <>
                <span className="font-medium text-slate-900 dark:text-primary">
                  {t('habits.empty.title')}
                </span>
                <span>{t('habits.today.emptyDescription')}</span>
              </>
            )}
            <Link
              to="/habits"
              className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-brand dark:hover:text-emerald-300"
            >
              {t('habits.today.goToHabits')}
            </Link>
          </Card>
        }
      />
    </section>
  )
}
