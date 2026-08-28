import { Flame } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * The streak, framed as something that is building rather than something that
 * can be lost.
 *
 * A zero streak is the only state worth special copy, and it reads as an
 * invitation. The domain resets a broken streak to 1 rather than 0 precisely so
 * this component never has to render "0" after a quiet stretch.
 */

export interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
  className?: string
}

export function StreakBadge({
  currentStreak,
  longestStreak,
  className,
}: StreakBadgeProps) {
  const started = currentStreak > 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2',
        started ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      <Flame
        className={cn('size-5 shrink-0', started ? 'text-amber-500' : 'text-slate-400')}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {started ? `${String(currentStreak)}-day streak` : 'Today can be day one'}
        </p>
        <p className="text-xs opacity-80">
          {longestStreak > 0
            ? `Best so far: ${String(longestStreak)} days`
            : 'Your best run shows up here'}
        </p>
      </div>
    </div>
  )
}
