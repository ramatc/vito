import { createElement } from 'react'
import { Archive, Check, Pencil } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { XP_BY_DIFFICULTY } from '../../domain/habit/xpReward'
import { useTranslate } from '../../hooks/useTranslate'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { Habit } from '../../types/models'
import { cn } from '../../utils/cn'
import { describeFrequency } from './frequency'
import { resolveHabitIcon } from './habitIcons'

/**
 * One habit, as a row. It reports taps and knows nothing about XP rules or what
 * completing actually does — the only state it reads is the active locale, which
 * `features/` is the ring that owns.
 */

export interface HabitCardProps {
  habit: Habit
  completed: boolean
  onToggle(habitId: string): void
  onEdit?(habit: Habit): void
  onArchive?(habit: Habit): void
  disabled?: boolean
}

export function HabitCard({
  habit,
  completed,
  onToggle,
  onEdit,
  onArchive,
  disabled = false,
}: HabitCardProps) {
  const t = useTranslate()
  const locale = usePreferencesStore((state) => state.preferences.locale)

  // XP derived from the single source of truth rather than inlined:
  // XP_BY_DIFFICULTY's own comment says no call site may hardcode these numbers.
  const xpHint = t('common.xp', { count: XP_BY_DIFFICULTY[habit.difficulty] })

  // `createElement` rather than `const Icon = ...; <Icon />`: the lookup returns
  // a stable reference from a module-level registry, but a capitalised local
  // reads to both a linter and a reviewer as a component defined during render.
  const icon = createElement(resolveHabitIcon(habit.icon), { className: 'size-5' })

  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-3',
        completed && 'bg-emerald-50/60 dark:bg-emerald-500/10',
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          completed
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300',
        )}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            completed
              ? 'text-emerald-900 dark:text-emerald-200'
              : 'text-slate-900 dark:text-primary',
          )}
        >
          {habit.name}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-muted">
          {habit.category} · {describeFrequency(locale, habit.frequency)} · {xpHint}
        </p>
      </div>

      {onEdit !== undefined && (
        <button
          type="button"
          aria-label={t('habits.card.edit', { name: habit.name })}
          onClick={() => {
            onEdit(habit)
          }}
          className="inline-flex size-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {onArchive !== undefined && (
        <button
          type="button"
          aria-label={t('habits.card.archive', { name: habit.name })}
          onClick={() => {
            onArchive(habit)
          }}
          className="inline-flex size-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <Archive className="size-4" />
        </button>
      )}

      <button
        type="button"
        // A checkbox role rather than a plain button: the control is a
        // two-state toggle, and screen readers should announce it as one.
        role="checkbox"
        aria-checked={completed}
        aria-label={t(completed ? 'habits.card.uncheck' : 'habits.card.complete', {
          name: habit.name,
        })}
        disabled={disabled}
        onClick={() => {
          onToggle(habit.id)
        }}
        className={cn(
          'inline-flex size-11 shrink-0 items-center justify-center rounded-full ring-1 transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          completed
            ? // The filled state inverts its tick rather than keeping it white:
              // `--brand` is a light mint in the dark theme, the same reason
              // `Button`'s primary variant takes `--surface` for its lettering.
              'bg-emerald-600 text-white ring-emerald-600 dark:bg-brand dark:text-surface dark:ring-brand'
            : 'bg-white text-slate-300 ring-slate-300 hover:text-emerald-600 hover:ring-emerald-400 dark:bg-surface-raised dark:text-slate-600 dark:ring-slate-600 dark:hover:text-brand dark:hover:ring-brand',
        )}
      >
        <Check className="size-5" />
      </button>
    </Card>
  )
}
