import { describe, expect, it } from 'vitest'
import {
  MOMENTUM,
  applyComebackRecovery,
  applyCompletionCredit,
  rollOverMomentum,
} from './momentum'

describe('MOMENTUM constants', () => {
  it('keeps a floor above zero, so momentum never reads as total failure', () => {
    expect(MOMENTUM.MIN).toBeGreaterThan(0)
    expect(MOMENTUM.MIN).toBeLessThan(MOMENTUM.START)
    expect(MOMENTUM.START).toBeLessThan(MOMENTUM.MAX)
  })

  it('caps a single day below what three completions would otherwise credit', () => {
    expect(MOMENTUM.DAILY_CREDIT_CAP).toBeLessThan(MOMENTUM.COMPLETION_CREDIT * 10)
  })
})

describe('applyCompletionCredit', () => {
  it('credits a completion and reports the delta', () => {
    expect(applyCompletionCredit({ momentum: 50, creditedToday: 0 })).toEqual({
      momentum: 55,
      delta: 5,
      creditedToday: 5,
    })
  })

  it('accumulates across completions within the same day', () => {
    const first = applyCompletionCredit({ momentum: 50, creditedToday: 0 })
    const second = applyCompletionCredit({
      momentum: first.momentum,
      creditedToday: first.creditedToday,
    })

    expect(second).toEqual({ momentum: 60, delta: 5, creditedToday: 10 })
  })

  it('stops crediting once the daily cap is reached', () => {
    expect(
      applyCompletionCredit({ momentum: 65, creditedToday: MOMENTUM.DAILY_CREDIT_CAP }),
    ).toEqual({
      momentum: 65,
      delta: 0,
      creditedToday: MOMENTUM.DAILY_CREDIT_CAP,
    })
  })

  it('grants only the remaining allowance on the completion that hits the cap', () => {
    expect(applyCompletionCredit({ momentum: 62, creditedToday: 12 })).toEqual({
      momentum: 65,
      delta: 3,
      creditedToday: 15,
    })
  })

  it('blocks a ten-completion spam day at the daily cap', () => {
    let momentum: number = MOMENTUM.START
    let creditedToday = 0

    for (let i = 0; i < 10; i += 1) {
      const result = applyCompletionCredit({ momentum, creditedToday })
      momentum = result.momentum
      creditedToday = result.creditedToday
    }

    expect(momentum).toBe(MOMENTUM.START + MOMENTUM.DAILY_CREDIT_CAP)
    expect(creditedToday).toBe(MOMENTUM.DAILY_CREDIT_CAP)
  })

  it('never exceeds MAX, and reports the truncated delta honestly', () => {
    expect(applyCompletionCredit({ momentum: 98, creditedToday: 0 })).toEqual({
      momentum: MOMENTUM.MAX,
      delta: 2,
      creditedToday: 5,
    })
  })

  it('credits nothing when already at MAX', () => {
    expect(applyCompletionCredit({ momentum: MOMENTUM.MAX, creditedToday: 0 })).toEqual({
      momentum: MOMENTUM.MAX,
      delta: 0,
      creditedToday: 5,
    })
  })
})

describe('applyComebackRecovery', () => {
  it('credits the comeback recovery on top of the current momentum', () => {
    expect(applyComebackRecovery(50)).toBe(50 + MOMENTUM.COMEBACK_RECOVERY_CREDIT)
  })

  it('lifts a returning user off the floor by the full credit', () => {
    expect(applyComebackRecovery(MOMENTUM.MIN)).toBe(
      MOMENTUM.MIN + MOMENTUM.COMEBACK_RECOVERY_CREDIT,
    )
  })

  it('never exceeds MAX when the credit would overshoot it', () => {
    expect(applyComebackRecovery(MOMENTUM.MAX - 1)).toBe(MOMENTUM.MAX)
  })

  it('stays at MAX when there is nothing left to recover', () => {
    expect(applyComebackRecovery(MOMENTUM.MAX)).toBe(MOMENTUM.MAX)
  })
})

describe('rollOverMomentum', () => {
  it('is exactly neutral when no scheduled day was missed', () => {
    expect(
      rollOverMomentum({ momentum: 40, missedScheduledDays: 0, hadActivityBefore: true }),
    ).toEqual({ momentum: 40, delta: 0, creditedToday: 0 })
  })

  it('forgives the first missed day after an active stretch', () => {
    expect(
      rollOverMomentum({ momentum: 50, missedScheduledDays: 1, hadActivityBefore: true }),
    ).toEqual({ momentum: 50, delta: 0, creditedToday: 0 })
  })

  it('charges from the first day when there was no active stretch to forgive', () => {
    expect(
      rollOverMomentum({
        momentum: 50,
        missedScheduledDays: 1,
        hadActivityBefore: false,
      }),
    ).toEqual({ momentum: 42, delta: -8, creditedToday: 0 })
  })

  it('charges every missed day beyond the grace day', () => {
    expect(
      rollOverMomentum({ momentum: 50, missedScheduledDays: 3, hadActivityBefore: true }),
    ).toEqual({ momentum: 34, delta: -16, creditedToday: 0 })
  })

  it('never drops below MIN, even after thirty missed days', () => {
    const result = rollOverMomentum({
      momentum: MOMENTUM.MAX,
      missedScheduledDays: 30,
      hadActivityBefore: true,
    })

    expect(result.momentum).toBe(MOMENTUM.MIN)
    expect(result.delta).toBe(MOMENTUM.MIN - MOMENTUM.MAX)
  })

  it('stays at MIN when already at the floor', () => {
    expect(
      rollOverMomentum({
        momentum: MOMENTUM.MIN,
        missedScheduledDays: 5,
        hadActivityBefore: false,
      }),
    ).toEqual({ momentum: MOMENTUM.MIN, delta: 0, creditedToday: 0 })
  })

  it('resets the daily credit allowance, so a new day starts with a full budget', () => {
    const rolled = rollOverMomentum({
      momentum: 60,
      missedScheduledDays: 0,
      hadActivityBefore: true,
    })

    expect(rolled.creditedToday).toBe(0)

    const credited = applyCompletionCredit({
      momentum: rolled.momentum,
      creditedToday: rolled.creditedToday,
    })

    expect(credited.delta).toBe(MOMENTUM.COMPLETION_CREDIT)
  })
})
