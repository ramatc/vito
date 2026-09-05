import { Flame } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * The streak, framed as something that is building rather than something that
 * can be lost.
 *
 * A zero streak is the only state worth special copy, and it reads as an
 * invitation. The domain resets a broken streak to 1 rather than 0 precisely so
 * this component never has to render "0" after a quiet stretch.
 *
 * Both sentences arrive resolved from `ProgressSection`, and so does the one
 * predicate they turn on. Taking `hasStreak` rather than the raw count is what
 * makes it impossible to paint the warm state next to the invitation copy: the
 * question is asked once, upstream, where the words are chosen.
 */

export interface StreakBadgeProps {
  /** Whether a streak is running. Drives the warm palette. */
  hasStreak: boolean
  /** The streak itself, e.g. "3-day streak", or the invitation. */
  headline: string
  /** The personal best line, or the placeholder for someone who has none. */
  best: string
  className?: string
}

export function StreakBadge({ hasStreak, headline, best, className }: StreakBadgeProps) {
  const started = hasStreak

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2',
        // The dark pair lifts the neutral state onto a raised slate rather than
        // pairing tint for tint: `bg-slate-100 text-slate-600` inverted
        // mechanically keeps both halves the same distance apart and stays as
        // hard to read as it is in light.
        started
          ? 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
        className,
      )}
    >
      <Flame
        className={cn(
          'size-5 shrink-0',
          started
            ? 'text-amber-500 dark:text-amber-300'
            : 'text-slate-400 dark:text-slate-300',
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">{headline}</p>
        <p className="text-xs opacity-80">{best}</p>
      </div>
    </div>
  )
}
