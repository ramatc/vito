import type { ComponentType } from 'react'
import { useId } from 'react'
import { cn } from '../../utils/cn'

/**
 * Picks one icon key from a supplied set.
 *
 * The options are a prop, not an import: this ring is presentational, and the
 * icon registry is a habits concern. That is also what stops a UI primitive from
 * reaching into `features/`.
 */

export interface IconOption {
  /** Persisted key — this is what lands in `Habit.icon`. */
  name: string
  label: string
  Icon: ComponentType<{ className?: string }>
}

export interface IconPickerProps {
  options: readonly IconOption[]
  value: string
  onChange(name: string): void
  label: string
}

export function IconPicker({ options, value, onChange, label }: IconPickerProps) {
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-sm font-medium text-slate-700 dark:text-primary">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid grid-cols-6 gap-2 sm:grid-cols-8"
      >
        {options.map((option) => {
          const selected = option.name === value

          return (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              onClick={() => {
                onChange(option.name)
              }}
              className={cn(
                'flex size-11 items-center justify-center rounded-xl ring-1 transition-colors',
                selected
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-400 dark:bg-emerald-500/15 dark:text-brand dark:ring-brand'
                  : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50 dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700',
              )}
            >
              <option.Icon className="size-5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
