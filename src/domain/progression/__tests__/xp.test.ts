import { describe, expect, it } from 'vitest'
import {
  LEVEL_CURVE,
  calculateLevel,
  calculateProgressToNextLevel,
  calculateXpForNextLevel,
  xpThresholdForLevel,
} from '../xp'

const ALL_LEVELS = Array.from({ length: LEVEL_CURVE.MAX_LEVEL }, (_, i) => i + 1)

describe('xpThresholdForLevel', () => {
  it('puts level 1 at zero XP, so a brand new user is already level 1', () => {
    expect(xpThresholdForLevel(1)).toBe(0)
  })

  it('follows BASE_XP * (level - 1) ** EXPONENT', () => {
    expect(xpThresholdForLevel(2)).toBe(100)
    expect(xpThresholdForLevel(3)).toBe(283)
    expect(xpThresholdForLevel(4)).toBe(520)
    expect(xpThresholdForLevel(5)).toBe(800)
  })

  it('increases strictly with every level', () => {
    for (const level of ALL_LEVELS.slice(1)) {
      expect(xpThresholdForLevel(level)).toBeGreaterThan(xpThresholdForLevel(level - 1))
    }
  })

  it('clamps levels below 1 to the level 1 threshold', () => {
    expect(xpThresholdForLevel(0)).toBe(0)
    expect(xpThresholdForLevel(-5)).toBe(0)
  })

  it('clamps levels above MAX_LEVEL to the MAX_LEVEL threshold', () => {
    expect(xpThresholdForLevel(LEVEL_CURVE.MAX_LEVEL + 1)).toBe(
      xpThresholdForLevel(LEVEL_CURVE.MAX_LEVEL),
    )
    expect(xpThresholdForLevel(5000)).toBe(xpThresholdForLevel(LEVEL_CURVE.MAX_LEVEL))
  })
})

describe('calculateLevel', () => {
  it('returns level 1 for zero XP, never 0 and never an error', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('returns level 1 for a negative total, rather than a negative level', () => {
    expect(calculateLevel(-50)).toBe(1)
  })

  it('counts an exact threshold as having reached that level', () => {
    expect(calculateLevel(100)).toBe(2)
    expect(calculateLevel(283)).toBe(3)
    expect(calculateLevel(800)).toBe(5)
  })

  it('stays on the lower level one XP below a threshold', () => {
    expect(calculateLevel(99)).toBe(1)
    expect(calculateLevel(282)).toBe(2)
    expect(calculateLevel(799)).toBe(4)
  })

  it('advances one XP above a threshold', () => {
    expect(calculateLevel(101)).toBe(2)
    expect(calculateLevel(284)).toBe(3)
  })

  it('clamps at MAX_LEVEL no matter how much XP is banked', () => {
    expect(calculateLevel(999_999_999)).toBe(LEVEL_CURVE.MAX_LEVEL)
  })

  it('is the exact inverse of xpThresholdForLevel for every level', () => {
    // The load-bearing invariant. The closed-form algebraic inverse disagrees
    // with the ROUNDED forward threshold at some boundaries, which would be a
    // silent off-by-one level. This proves forward and inverse agree.
    for (const level of ALL_LEVELS) {
      expect(calculateLevel(xpThresholdForLevel(level))).toBe(level)
    }
  })

  it('is one level lower one XP below every threshold', () => {
    for (const level of ALL_LEVELS.slice(1)) {
      expect(calculateLevel(xpThresholdForLevel(level) - 1)).toBe(level - 1)
    }
  })
})

describe('calculateXpForNextLevel', () => {
  it('returns the absolute total-XP threshold of the next level, not the remainder', () => {
    expect(calculateXpForNextLevel(0)).toBe(100)
    expect(calculateXpForNextLevel(150)).toBe(283)
  })

  it('returns the following threshold when sitting exactly on one', () => {
    expect(calculateXpForNextLevel(100)).toBe(283)
  })

  it('returns the current threshold at MAX_LEVEL, so the UI has no next target', () => {
    const maxThreshold = xpThresholdForLevel(LEVEL_CURVE.MAX_LEVEL)

    expect(calculateXpForNextLevel(maxThreshold)).toBe(maxThreshold)
    expect(calculateXpForNextLevel(maxThreshold + 10_000)).toBe(maxThreshold)
  })

  it('is always strictly above the current threshold below MAX_LEVEL', () => {
    for (const level of ALL_LEVELS.slice(0, -1)) {
      const threshold = xpThresholdForLevel(level)

      expect(calculateXpForNextLevel(threshold)).toBeGreaterThan(threshold)
    }
  })
})

describe('calculateProgressToNextLevel', () => {
  it('is 0 at the exact start of a level band', () => {
    expect(calculateProgressToNextLevel(0)).toBe(0)
    expect(calculateProgressToNextLevel(100)).toBe(0)
  })

  it('is 0.5 halfway through a band', () => {
    // Level 1 spans 0..100, so 50 XP is exactly half.
    expect(calculateProgressToNextLevel(50)).toBeCloseTo(0.5, 10)
    // Level 2 spans 100..283.
    expect(calculateProgressToNextLevel(191.5)).toBeCloseTo(0.5, 10)
  })

  it('approaches but never reaches 1 just below the next threshold', () => {
    const progress = calculateProgressToNextLevel(99)

    expect(progress).toBeGreaterThan(0.98)
    expect(progress).toBeLessThan(1)
  })

  it('is 1 at MAX_LEVEL, where there is nothing left to fill', () => {
    expect(calculateProgressToNextLevel(xpThresholdForLevel(LEVEL_CURVE.MAX_LEVEL))).toBe(
      1,
    )
    expect(calculateProgressToNextLevel(999_999_999)).toBe(1)
  })

  it('clamps to 0 for a negative total instead of returning a negative fraction', () => {
    expect(calculateProgressToNextLevel(-500)).toBe(0)
  })

  it('stays within [0, 1] across the whole curve', () => {
    for (const level of ALL_LEVELS) {
      const threshold = xpThresholdForLevel(level)

      for (const totalXp of [threshold, threshold + 1, threshold + 37]) {
        const progress = calculateProgressToNextLevel(totalXp)

        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(1)
      }
    }
  })
})
