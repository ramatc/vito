import { Modal } from '../../components/ui/Modal'
import { todayKey } from '../../domain/shared/date'
import { habitHeatmap, type HabitDayStatus } from '../../domain/habit/heatmap'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import { useHabitStore } from '../../stores/habitStore'
import type { Habit } from '../../types/models'
import { cn } from '../../utils/cn'
import { HabitHeatmap } from './HabitHeatmap'

export interface HabitStatsModalProps {
  open: boolean
  habit?: Habit
  onClose(): void
}

/** How far back the heatmap looks, in days. */
const HEATMAP_DAYS = 60

const LEGEND_ORDER: HabitDayStatus[] = ['completed', 'missed', 'rest', 'pending']

const LEGEND_SWATCH_CLASSES: Record<HabitDayStatus, string> = {
  completed: 'bg-brand',
  missed: 'bg-surface-sunken ring-1 ring-border',
  rest: 'bg-surface-sunken opacity-40',
  pending: 'bg-transparent ring-1 ring-brand',
}

const LEGEND_LABEL_KEYS: Record<HabitDayStatus, TranslationKey> = {
  completed: 'habits.stats.legend.completed',
  missed: 'habits.stats.legend.missed',
  rest: 'habits.stats.legend.rest',
  pending: 'habits.stats.legend.pending',
}

export function HabitStatsModal({ open, habit, onClose }: HabitStatsModalProps) {
  const t = useTranslate()
  const completions = useHabitStore((state) => state.completions)

  const stats =
    habit === undefined ? undefined : habitHeatmap(habit, completions, todayKey(), HEATMAP_DAYS)

  return (
    <Modal
      open={open}
      title={habit === undefined ? '' : t('habits.stats.title', { name: habit.name })}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      {stats !== undefined && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {t('habits.stats.summary', {
              completed: stats.completedCount,
              scheduled: stats.scheduledCount,
            })}
          </p>

          <HabitHeatmap days={stats.days} />

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGEND_ORDER.map((status) => (
              <span key={status} className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className={cn('size-3 shrink-0 rounded-sm', LEGEND_SWATCH_CLASSES[status])}
                />
                {t(LEGEND_LABEL_KEYS[status])}
              </span>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
