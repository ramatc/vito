import { useEffect, useRef } from 'react'
import type { HabitHeatmapDay } from '../../domain/habit/heatmap'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import { cn } from '../../utils/cn'

export interface HabitHeatmapProps {
  days: HabitHeatmapDay[]
}

const STATUS_CLASSES: Record<HabitHeatmapDay['status'], string> = {
  completed: 'bg-brand',
  missed: 'bg-surface-sunken ring-1 ring-border',
  rest: 'bg-surface-sunken opacity-40',
  pending: 'bg-transparent ring-1 ring-brand',
}

// A keyed template literal fails `TranslationKey`'s exact-union check, so the
// day status maps to a real key here instead of building one at runtime.
const STATUS_LABEL_KEYS: Record<HabitHeatmapDay['status'], TranslationKey> = {
  completed: 'habits.stats.legend.completed',
  missed: 'habits.stats.legend.missed',
  rest: 'habits.stats.legend.rest',
  pending: 'habits.stats.legend.pending',
}

/**
 * A trailing single-row heatmap, oldest day on the left. `overflow-x-auto`
 * plus the scroll-to-end effect below keep today visible by default without
 * ever forcing the page itself to scroll horizontally on a narrow viewport.
 */
export function HabitHeatmap({ days }: HabitHeatmapProps) {
  const t = useTranslate()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current

    if (el !== null) {
      el.scrollLeft = el.scrollWidth
    }
  }, [days])

  return (
    <div ref={scrollRef} className="overflow-x-auto">
      <div className="flex gap-1">
        {days.map((day) => (
          <span
            key={day.date}
            title={t(STATUS_LABEL_KEYS[day.status])}
            aria-label={t(STATUS_LABEL_KEYS[day.status])}
            className={cn('size-3.5 shrink-0 rounded-sm', STATUS_CLASSES[day.status])}
          />
        ))}
      </div>
    </div>
  )
}
