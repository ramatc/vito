import { cn } from '../../utils/cn'

/**
 * A 0..1 fill. Takes a fraction rather than a percentage because every domain
 * function that feeds it (`calculateProgressToNextLevel`, today's completion
 * ratio) already returns one — converting at the boundary keeps the rounding in
 * exactly one place.
 */

export interface ProgressBarProps {
  /** Fraction in [0, 1]. Values outside the range are clamped. */
  value: number
  label: string
  /** Shown next to the label, e.g. "40 / 100 XP". */
  hint?: string
  className?: string
}

export function ProgressBar({ value, label, hint, className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1)
  const percent = Math.round(clamped * 100)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        {hint !== undefined && <span className="text-slate-500">{hint}</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${String(percent)}%` }}
        />
      </div>
    </div>
  )
}
