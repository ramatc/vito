import { createElement } from 'react'
import { Archive, Check, Pencil } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import type { Habit } from '../../types/models'
import { cn } from '../../utils/cn'
import { describeFrequency } from './frequency'
import { resolveHabitIcon } from './habitIcons'

/**
 * One habit, as a row. Presentational: it reports taps and knows nothing about
 * stores, XP or what completing actually does.
 */

const XP_HINT: Record<Habit['difficulty'], string> = {
  easy: '10 XP',
  normal: '20 XP',
  hard: '30 XP',
}

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
  // `createElement` rather than `const Icon = ...; <Icon />`: the lookup returns
  // a stable reference from a module-level registry, but a capitalised local
  // reads to both a linter and a reviewer as a component defined during render.
  const icon = createElement(resolveHabitIcon(habit.icon), { className: 'size-5' })

  return (
    <Card className={cn('flex items-center gap-3 p-3', completed && 'bg-emerald-50/60')}>
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
        )}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium',
            completed ? 'text-emerald-900' : 'text-slate-900',
          )}
        >
          {habit.name}
        </p>
        <p className="truncate text-xs text-slate-500">
          {habit.category} · {describeFrequency(habit.frequency)} ·{' '}
          {XP_HINT[habit.difficulty]}
        </p>
      </div>

      {onEdit !== undefined && (
        <button
          type="button"
          aria-label={`Edit ${habit.name}`}
          onClick={() => {
            onEdit(habit)
          }}
          className="inline-flex size-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {onArchive !== undefined && (
        <button
          type="button"
          aria-label={`Archive ${habit.name}`}
          onClick={() => {
            onArchive(habit)
          }}
          className="inline-flex size-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
        aria-label={completed ? `Uncheck ${habit.name}` : `Complete ${habit.name}`}
        disabled={disabled}
        onClick={() => {
          onToggle(habit.id)
        }}
        className={cn(
          'inline-flex size-11 shrink-0 items-center justify-center rounded-full ring-1 transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-50',
          completed
            ? 'bg-emerald-600 text-white ring-emerald-600'
            : 'bg-white text-slate-300 ring-slate-300 hover:text-emerald-600 hover:ring-emerald-400',
        )}
      >
        <Check className="size-5" />
      </button>
    </Card>
  )
}
