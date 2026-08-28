import type { ComebackBoost, DateKey } from '../../types/models'
import { daysBetween } from '../shared/date'
import { MOMENTUM } from './momentum'

/**
 * The comeback boost: what happens when someone returns after a quiet stretch.
 *
 * It is deliberately NOT a quest system. The whole mechanic is one nullable
 * field on `UserProgress` plus the two pure functions below — no quest entity,
 * no repository, no UI surface of its own.
 */
export const COMEBACK = {
  INACTIVITY_TRIGGER_DAYS: 3,
  BONUS_COMPLETIONS: 3,
  BONUS_MULTIPLIER: 1.5,
  MOMENTUM_RECOVERY_CREDIT: MOMENTUM.COMEBACK_RECOVERY_CREDIT,
  /** Must exceed INACTIVITY_TRIGGER_DAYS, or going quiet on purpose farms the bonus. */
  COOLDOWN_DAYS: 7,
} as const

/** Evaluated once per day during the rollover, never on every render. */
export function shouldTriggerComeback(input: {
  daysSinceLastActivity: number
  lastComebackDate: DateKey | null
  today: DateKey
}): boolean {
  if (input.daysSinceLastActivity < COMEBACK.INACTIVITY_TRIGGER_DAYS) {
    return false
  }

  if (input.lastComebackDate === null) {
    return true
  }

  return daysBetween(input.lastComebackDate, input.today) >= COMEBACK.COOLDOWN_DAYS
}

export function startComeback(today: DateKey): ComebackBoost {
  return {
    remainingCompletions: COMEBACK.BONUS_COMPLETIONS,
    multiplier: COMEBACK.BONUS_MULTIPLIER,
    triggeredOn: today,
  }
}

/**
 * Applies an active boost to one completion's XP and returns the spent-down
 * boost, or `null` once it is exhausted.
 *
 * The window is counted in completions rather than wall-clock time on purpose:
 * a time-boxed bonus can silently expire mid-session, which reads as
 * punishment, and it cannot be tested without freezing the clock.
 */
export function applyComebackToXp(
  baseXp: number,
  boost: ComebackBoost | null,
): { xp: number; boost: ComebackBoost | null } {
  if (boost === null || boost.remainingCompletions <= 0) {
    return { xp: baseXp, boost: null }
  }

  const remainingCompletions = boost.remainingCompletions - 1

  return {
    xp: Math.round(baseXp * boost.multiplier),
    boost: remainingCompletions > 0 ? { ...boost, remainingCompletions } : null,
  }
}
