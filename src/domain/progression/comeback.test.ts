import { describe, expect, it } from 'vitest'
import type { ComebackBoost } from '../../types/models'
import { MOMENTUM } from './momentum'
import {
  COMEBACK,
  applyComebackToXp,
  shouldTriggerComeback,
  startComeback,
} from './comeback'

const TODAY = '2026-03-20'

describe('COMEBACK constants', () => {
  it('reuses the momentum recovery credit instead of redeclaring it', () => {
    expect(COMEBACK.MOMENTUM_RECOVERY_CREDIT).toBe(MOMENTUM.COMEBACK_RECOVERY_CREDIT)
  })

  it('keeps the cooldown longer than the trigger, so the two cannot oscillate', () => {
    expect(COMEBACK.COOLDOWN_DAYS).toBeGreaterThan(COMEBACK.INACTIVITY_TRIGGER_DAYS)
  })

  it('boosts XP upward for a bounded number of completions', () => {
    expect(COMEBACK.BONUS_MULTIPLIER).toBeGreaterThan(1)
    expect(COMEBACK.BONUS_COMPLETIONS).toBeGreaterThan(0)
  })
})

describe('shouldTriggerComeback', () => {
  it('does not trigger one day below the inactivity threshold', () => {
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: COMEBACK.INACTIVITY_TRIGGER_DAYS - 1,
        lastComebackDate: null,
        today: TODAY,
      }),
    ).toBe(false)
  })

  it('triggers at exactly the inactivity threshold', () => {
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: COMEBACK.INACTIVITY_TRIGGER_DAYS,
        lastComebackDate: null,
        today: TODAY,
      }),
    ).toBe(true)
  })

  it('triggers well past the threshold', () => {
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: 30,
        lastComebackDate: null,
        today: TODAY,
      }),
    ).toBe(true)
  })

  it('is blocked one day before the cooldown expires', () => {
    // Last comeback 6 days ago, cooldown 7 — this is the oscillation exploit
    // guard: go quiet, come back, go quiet again, farm the bonus forever.
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: 10,
        lastComebackDate: '2026-03-14',
        today: TODAY,
      }),
    ).toBe(false)
  })

  it('is allowed on the exact day the cooldown expires', () => {
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: 10,
        lastComebackDate: '2026-03-13',
        today: TODAY,
      }),
    ).toBe(true)
  })

  it('is allowed after the cooldown expires', () => {
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: 10,
        lastComebackDate: '2026-01-01',
        today: TODAY,
      }),
    ).toBe(true)
  })

  it('stays blocked by the cooldown even when inactivity is extreme', () => {
    expect(
      shouldTriggerComeback({
        daysSinceLastActivity: 365,
        lastComebackDate: '2026-03-19',
        today: TODAY,
      }),
    ).toBe(false)
  })
})

describe('startComeback', () => {
  it('opens a boost counted in completions, not wall-clock time', () => {
    expect(startComeback(TODAY)).toEqual({
      remainingCompletions: COMEBACK.BONUS_COMPLETIONS,
      multiplier: COMEBACK.BONUS_MULTIPLIER,
      triggeredOn: TODAY,
    })
  })
})

describe('applyComebackToXp', () => {
  it('leaves XP untouched when no boost is active', () => {
    expect(applyComebackToXp(20, null)).toEqual({ xp: 20, boost: null })
  })

  it('multiplies XP and decrements the counter', () => {
    expect(applyComebackToXp(20, startComeback(TODAY))).toEqual({
      xp: 30,
      boost: { remainingCompletions: 2, multiplier: 1.5, triggeredOn: TODAY },
    })
  })

  it('rounds a fractional result to a whole XP value', () => {
    expect(applyComebackToXp(25, startComeback(TODAY)).xp).toBe(38)
  })

  it('boosts exactly BONUS_COMPLETIONS completions, then expires itself', () => {
    const awarded: number[] = []
    let boost: ComebackBoost | null = startComeback(TODAY)

    for (let i = 0; i < COMEBACK.BONUS_COMPLETIONS; i += 1) {
      const result = applyComebackToXp(20, boost)
      awarded.push(result.xp)
      boost = result.boost
    }

    expect(awarded).toEqual([30, 30, 30])
    expect(boost).toBeNull()

    // And the very next completion is back to base XP.
    expect(applyComebackToXp(20, boost)).toEqual({ xp: 20, boost: null })
  })

  it('treats an already-exhausted boost as absent', () => {
    expect(
      applyComebackToXp(20, {
        remainingCompletions: 0,
        multiplier: 1.5,
        triggeredOn: TODAY,
      }),
    ).toEqual({ xp: 20, boost: null })
  })
})
