import { useMemo } from 'react'
import { MOMENTUM } from '../domain/progression/momentum'
import {
  LEVEL_CURVE,
  calculateLevel,
  calculateProgressToNextLevel,
  calculateXpForNextLevel,
  xpThresholdForLevel,
} from '../domain/progression/xp'
import { useProgressStore } from '../stores/progressStore'
import type { DateKey } from '../types/models'

/**
 * The progression numbers a dashboard needs, derived from `totalXp`.
 *
 * Every value here comes out of `domain/progression/**` — level, thresholds and
 * the band fraction are read from the curve, never recomputed locally. That is
 * the whole point of the derived-not-stored rule (design §4): retuning
 * `LEVEL_CURVE` has to move this UI without anyone editing this file.
 */

export interface ProgressView {
  totalXp: number
  level: number
  isMaxLevel: boolean
  /** XP earned so far inside the current level band. */
  xpIntoLevel: number
  /** What the current level band is worth end to end. Zero at max level. */
  xpForLevel: number
  /** XP still to go before the next level. Zero at max level. */
  xpToNextLevel: number
  /** Fraction 0..1 through the current level band. */
  levelProgress: number
  momentum: number
  /** Momentum as a 0..1 fraction of its ceiling, ready for a bar. */
  momentumFraction: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: DateKey | null
  /** A comeback boost is active and still has completions on it. */
  boostActive: boolean
  boostRemaining: number
  isLoading: boolean
}

export function useProgress(): ProgressView {
  const progress = useProgressStore((state) => state.progress)
  const status = useProgressStore((state) => state.status)

  return useMemo(() => {
    const level = calculateLevel(progress.totalXp)
    const currentThreshold = xpThresholdForLevel(level)
    const nextThreshold = calculateXpForNextLevel(progress.totalXp)
    const boostRemaining = progress.activeBoost?.remainingCompletions ?? 0

    return {
      totalXp: progress.totalXp,
      level,
      isMaxLevel: level === LEVEL_CURVE.MAX_LEVEL,
      xpIntoLevel: progress.totalXp - currentThreshold,
      xpForLevel: nextThreshold - currentThreshold,
      xpToNextLevel: Math.max(nextThreshold - progress.totalXp, 0),
      levelProgress: calculateProgressToNextLevel(progress.totalXp),
      momentum: progress.momentum,
      momentumFraction: progress.momentum / MOMENTUM.MAX,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastActivityDate: progress.lastActivityDate,
      boostActive: boostRemaining > 0,
      boostRemaining,
      isLoading: status !== 'ready',
    }
  }, [progress, status])
}
