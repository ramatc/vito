import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../../components/layout/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { habitsWeeklyReport } from '../../domain/habit/weeklyReport'
import { addDays, startOfWeek, todayKey } from '../../domain/shared/date'
import { useProgress } from '../../hooks/useProgress'
import { useTranslate } from '../../hooks/useTranslate'
import { useHabitStore } from '../../stores/habitStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { HabitWeekGrid } from './HabitWeekGrid'
import { weekdayOptions } from './frequency'
import { formatWeekRange } from './weekLabel'

/**
 * The all-habits weekly report: every active habit, one week at a time, plus
 * the footer numbers a single per-habit modal cannot show. Reached from the
 * habits screen rather than a new tab — a secondary destination, not a
 * fifth surface (product principle: fewer surfaces).
 */
export function HabitReportsScreen() {
  const t = useTranslate()
  const navigate = useNavigate()
  const locale = usePreferencesStore((state) => state.preferences.locale)
  const habits = useHabitStore((state) => state.habits)
  const completions = useHabitStore((state) => state.completions)
  const { longestStreak } = useProgress()

  // 0 = current week, negative = past weeks. Never positive: there is nothing
  // to report about a week that has not happened yet.
  const [weekOffset, setWeekOffset] = useState(0)

  const today = todayKey()
  const activeHabits = habits.filter((habit) => habit.archivedAt === undefined)
  const weekStart = startOfWeek(addDays(today, weekOffset * 7))

  const report = useMemo(
    () => habitsWeeklyReport(activeHabits, completions, weekStart, today),
    [activeHabits, completions, weekStart, today],
  )

  const bestDayLabel =
    report.bestWeekdayIndex === null
      ? t('habits.reports.stats.bestDay.none')
      : weekdayOptions(locale)[report.bestWeekdayIndex].short

  return (
    <Screen
      title={t('habits.reports.title')}
      description={t('habits.reports.description')}
      onBack={() => {
        navigate('/habits')
      }}
      backLabel={t('habits.reports.back')}
    >
      {activeHabits.length === 0 ? (
        <Card className="flex flex-col items-start gap-3 text-sm text-muted">
          <span className="font-medium text-primary">{t('habits.empty.title')}</span>
          <span>{t('habits.reports.empty.description')}</span>
          <Button
            size="sm"
            onClick={() => {
              navigate('/habits')
            }}
          >
            {t('habits.reports.empty.action')}
          </Button>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={t('habits.reports.week.previous')}
              onClick={() => {
                setWeekOffset((offset) => offset - 1)
              }}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-sunken hover:text-primary"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-sm font-medium text-primary">
              {formatWeekRange(locale, report.weekStart, report.weekEnd)}
            </span>

            <button
              type="button"
              aria-label={t('habits.reports.week.next')}
              disabled={weekOffset === 0}
              onClick={() => {
                setWeekOffset((offset) => offset + 1)
              }}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-sunken hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <HabitWeekGrid rows={report.rows} bestWeekdayIndex={report.bestWeekdayIndex} locale={locale} />

          <div className="grid grid-cols-4 gap-2 border-t border-border pt-4">
            <StatTile label={t('habits.reports.stats.metPercent')} value={`${String(report.metPercent)}%`} />
            <StatTile label={t('habits.reports.stats.bestDay')} value={bestDayLabel} />
            <StatTile
              label={t('habits.reports.stats.totalDone')}
              value={String(report.completedCount)}
            />
            <StatTile
              label={t('habits.reports.stats.bestStreak')}
              value={String(longestStreak)}
              tone="warm"
            />
          </div>
        </Card>
      )}
    </Screen>
  )
}

interface StatTileProps {
  label: string
  value: string
  tone?: 'warm'
}

function StatTile({ label, value, tone }: StatTileProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className={tone === 'warm' ? 'text-lg font-bold text-warm' : 'text-lg font-bold text-primary'}>
        {value}
      </span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  )
}
