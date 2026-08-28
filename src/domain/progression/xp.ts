/**
 * The XP -> level curve.
 *
 * `totalXp` is the only progression fact that is ever stored. Level, evolution
 * stage and mood are all derived from it on read, so retuning the two constants
 * below rebalances every existing save instantly, with no migration.
 */
export const LEVEL_CURVE = {
  BASE_XP: 100,
  EXPONENT: 1.5,
  MAX_LEVEL: 99,
} as const

function clampLevel(level: number): number {
  return Math.min(Math.max(Math.trunc(level), 1), LEVEL_CURVE.MAX_LEVEL)
}

/**
 * Cumulative total XP required to BE at `level`. Level 1 costs nothing.
 *
 * This is the single source of truth for the curve: `calculateLevel` is defined
 * as its inverse rather than as an independent formula.
 */
export function xpThresholdForLevel(level: number): number {
  return Math.round(LEVEL_CURVE.BASE_XP * (clampLevel(level) - 1) ** LEVEL_CURVE.EXPONENT)
}

/**
 * The level a given total XP has reached. An exact threshold counts as having
 * reached that level.
 *
 * Deliberately walks the thresholds instead of using the closed-form inverse
 * `floor((xp / BASE) ** (1 / EXPONENT)) + 1`. That form is O(1) but can
 * disagree with the *rounded* forward threshold at exact boundaries — a silent
 * off-by-one level. Walking makes forward and inverse consistent by
 * construction, and MAX_LEVEL caps the loop at 99 cheap comparisons.
 */
export function calculateLevel(totalXp: number): number {
  let level = 1

  while (level < LEVEL_CURVE.MAX_LEVEL && totalXp >= xpThresholdForLevel(level + 1)) {
    level += 1
  }

  return level
}

/**
 * The ABSOLUTE total-XP threshold at which the next level is reached — not the
 * remaining XP. The UI computes "XP to go" as this minus `totalXp`.
 *
 * At MAX_LEVEL there is no next target, so the current threshold is returned.
 */
export function calculateXpForNextLevel(totalXp: number): number {
  const level = calculateLevel(totalXp)

  return xpThresholdForLevel(level === LEVEL_CURVE.MAX_LEVEL ? level : level + 1)
}

/** How far through the CURRENT level band, as a fraction in [0, 1]. 1 at MAX_LEVEL. */
export function calculateProgressToNextLevel(totalXp: number): number {
  const currentThreshold = xpThresholdForLevel(calculateLevel(totalXp))
  const nextThreshold = calculateXpForNextLevel(totalXp)
  const band = nextThreshold - currentThreshold

  if (band <= 0) {
    return 1
  }

  const progress = (totalXp - currentThreshold) / band

  return Math.min(Math.max(progress, 0), 1)
}
