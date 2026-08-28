/**
 * Momentum: a bounded points bucket that replaces the "streak or nothing"
 * model. It is credited by completions and debited only by days that were
 * fully missed, and it never bottoms out at zero.
 */
export const MOMENTUM = {
  START: 50,
  /** Floor above zero on purpose: an empty bar reads as total failure. */
  MIN: 5,
  MAX: 100,
  COMPLETION_CREDIT: 5,
  /** Anti-farming: the most momentum a single day of completions can add. */
  DAILY_CREDIT_CAP: 15,
  MISSED_DAY_DEBIT: 8,
  /** The first missed day after an active stretch costs nothing. */
  GRACE_FIRST_MISSED_DAY: true,
  COMEBACK_RECOVERY_CREDIT: 15,
} as const

export interface MomentumResult {
  momentum: number
  /** Signed change actually applied, after clamping. */
  delta: number
  /** Momentum credited so far today, for the daily cap. */
  creditedToday: number
}

function clamp(momentum: number): number {
  return Math.min(Math.max(momentum, MOMENTUM.MIN), MOMENTUM.MAX)
}

/**
 * Credits one habit completion.
 *
 * The daily allowance is consumed by the credit granted from the bucket, even
 * when MAX truncates how much of it lands. Completing ten habits on one day and
 * none for a week must not out-earn a steady week.
 */
export function applyCompletionCredit(input: {
  momentum: number
  creditedToday: number
}): MomentumResult {
  const allowance = Math.max(MOMENTUM.DAILY_CREDIT_CAP - input.creditedToday, 0)
  const credit = Math.min(MOMENTUM.COMPLETION_CREDIT, allowance)
  const momentum = clamp(input.momentum + credit)

  return {
    momentum,
    delta: momentum - input.momentum,
    creditedToday: input.creditedToday + credit,
  }
}

/**
 * Applies a day rollover covering `missedScheduledDays` fully-missed days.
 *
 * Non-scheduled days never reach this function — the caller filters them out
 * with `countMissedScheduledDays`, which is what makes rest days strictly
 * neutral. Days with at least one completion are partial and also cost nothing.
 *
 * Resets the daily credit allowance: a new day starts with a full budget.
 */
export function rollOverMomentum(input: {
  momentum: number
  missedScheduledDays: number
  hadActivityBefore: boolean
}): MomentumResult {
  const graceDays = MOMENTUM.GRACE_FIRST_MISSED_DAY && input.hadActivityBefore ? 1 : 0
  const chargeableDays = Math.max(input.missedScheduledDays - graceDays, 0)
  const momentum = clamp(input.momentum - chargeableDays * MOMENTUM.MISSED_DAY_DEBIT)

  return {
    momentum,
    delta: momentum - input.momentum,
    creditedToday: 0,
  }
}
