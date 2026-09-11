import { createElement } from 'react'
import { Trophy } from 'lucide-react'
import type { HabitDayStatus } from '../../domain/habit/heatmap'
import type { HabitWeekRow } from '../../domain/habit/weeklyReport'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import type { Locale } from '../../types/models'
import { cn } from '../../utils/cn'
import { weekdayOptions } from './frequency'
import { resolveHabitIcon } from './habitIcons'
import { habitPaletteSlot } from './habitPalette'

/**
 * The all-habits weekly grid — purely presentational.
 *
 * Each row carries its own pastel background (`habitPaletteSlot`) instead of
 * the neutral tones `HabitHeatmap` uses, so "missed" and "rest" cells here are
 * deliberately NOT `bg-surface-sunken`: that would look identical on every
 * row and erase the one thing per-row color is for.
 */

export interface HabitWeekGridProps {
  rows: readonly HabitWeekRow[]
  bestWeekdayIndex: number | null
  locale: Locale
}

/** Leading name column, then 7 equal day columns. */
const GRID_COLUMNS =
  'grid grid-cols-[minmax(0,1.5fr)_repeat(7,minmax(0,1fr))] items-center gap-1'

const CELL_LABEL_KEYS: Record<HabitDayStatus, TranslationKey> = {
  completed: 'habits.reports.cell.completed',
  missed: 'habits.reports.cell.missed',
  rest: 'habits.reports.cell.rest',
  pending: 'habits.reports.cell.pending',
}

export function HabitWeekGrid({ rows, bestWeekdayIndex, locale }: HabitWeekGridProps) {
  const t = useTranslate()
  const weekdays = weekdayOptions(locale)

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn(GRID_COLUMNS, 'px-1')}>
        <span aria-hidden="true" />
        {weekdays.map((day) => (
          <span
            key={day.value}
            className="text-center text-xs font-semibold text-muted uppercase"
          >
            {day.short}
          </span>
        ))}
      </div>

      {rows.map((row, index) => {
        const palette = habitPaletteSlot(index)
        const icon = createElement(resolveHabitIcon(row.habit.icon), { className: 'size-4' })

        return (
          <div
            key={row.habit.id}
            className={cn(GRID_COLUMNS, 'rounded-xl px-2 py-2', palette.bgClass)}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="flex size-6 shrink-0 items-center justify-center text-primary">
                {icon}
              </span>
              <span className="truncate text-sm font-medium text-primary">
                {row.habit.name}
              </span>
            </div>

            {row.days.map((day) => (
              <span key={day.date} className="flex items-center justify-center">
                <span
                  aria-label={t(CELL_LABEL_KEYS[day.status], { name: row.habit.name })}
                  title={t(CELL_LABEL_KEYS[day.status], { name: row.habit.name })}
                  className={cn(
                    'size-6 shrink-0 rounded-md sm:size-7',
                    day.status === 'completed' && palette.fillClass,
                    day.status === 'pending' &&
                      cn('bg-transparent ring-1', palette.ringClass),
                    day.status === 'missed' && 'bg-surface-raised/60 ring-1 ring-border',
                    day.status === 'rest' && 'bg-surface-raised/60 opacity-40',
                  )}
                />
              </span>
            ))}
          </div>
        )
      })}

      <div className={cn(GRID_COLUMNS, 'px-1')}>
        <span className="truncate text-xs font-medium text-muted">
          {t('habits.reports.bestDay.label')}
        </span>
        {weekdays.map((day, index) => (
          <span key={day.value} className="flex items-center justify-center">
            {index === bestWeekdayIndex && (
              <Trophy
                className="size-4 text-warm"
                aria-label={t('habits.reports.bestDay.marker')}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
