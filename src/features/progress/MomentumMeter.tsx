import { ProgressBar } from '../../components/ui/ProgressBar'
import { MOMENTUM } from '../../domain/progression/momentum'

/**
 * Momentum, the forgiving counterpart to a streak.
 *
 * The caption is static and says the one thing the mechanic guarantees: the bar
 * has a floor above zero (`MOMENTUM.MIN`), so it can dip but never empties. The
 * ceiling is read from the domain constant rather than typed as "100" — the
 * balance numbers have exactly one home.
 */

export interface MomentumMeterProps {
  momentum: number
  /** Fraction 0..1 of the momentum ceiling. */
  fraction: number
  className?: string
}

export function MomentumMeter({ momentum, fraction, className }: MomentumMeterProps) {
  return (
    <div className={className}>
      <ProgressBar
        value={fraction}
        label="Momentum"
        hint={`${String(momentum)} / ${String(MOMENTUM.MAX)}`}
      />
      <p className="mt-1.5 text-xs text-slate-500">
        Momentum dips when things go quiet, and it never empties.
      </p>
    </div>
  )
}
