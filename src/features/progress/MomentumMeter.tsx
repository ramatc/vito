import { ProgressBar } from '../../components/ui/ProgressBar'
import { MOMENTUM } from '../../domain/progression/momentum'

/**
 * Momentum, the forgiving counterpart to a streak.
 *
 * The caption is static and says the one thing the mechanic guarantees: the bar
 * has a floor above zero (`MOMENTUM.MIN`), so it can dip but never empties. It
 * arrives resolved, along with the label, because this file may not reach a
 * store — but the hint stays here: `42 / 100` is two numbers and a slash, and
 * the ceiling is read from the domain constant rather than typed as "100", so
 * the balance numbers keep exactly one home.
 */

export interface MomentumMeterProps {
  momentum: number
  /** Fraction 0..1 of the momentum ceiling. */
  fraction: number
  /** The meter's name, e.g. "Momentum". */
  label: string
  /** The sentence under the bar, explaining that it has a floor. */
  caption: string
  className?: string
}

export function MomentumMeter({
  momentum,
  fraction,
  label,
  caption,
  className,
}: MomentumMeterProps) {
  return (
    <div className={className}>
      <ProgressBar
        value={fraction}
        label={label}
        hint={`${String(momentum)} / ${String(MOMENTUM.MAX)}`}
      />
      <p className="mt-1.5 text-xs text-slate-500 dark:text-muted">{caption}</p>
    </div>
  )
}
