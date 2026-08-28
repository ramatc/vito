import { describe, expect, it } from 'vitest'
import type { MoodInput } from './mood'
import { MOOD_RULES, MOOD_THRESHOLDS, deriveMood } from './mood'

function input(overrides: Partial<MoodInput> = {}): MoodInput {
  return {
    momentum: 50,
    todayCompletionRatio: 0,
    daysSinceLastActivity: 0,
    isRestDay: false,
    ...overrides,
  }
}

describe('every mood is reachable', () => {
  it('returns resting after a long quiet stretch', () => {
    expect(
      deriveMood(input({ daysSinceLastActivity: MOOD_THRESHOLDS.RESTING_DAYS })),
    ).toBe('resting')
  })

  it('returns thriving on a high-momentum, fully-completed day', () => {
    expect(deriveMood(input({ momentum: 90, todayCompletionRatio: 1 }))).toBe('thriving')
  })

  it('returns happy after any completion at all', () => {
    expect(deriveMood(input({ momentum: 30, todayCompletionRatio: 0.25 }))).toBe('happy')
  })

  it('returns happy on strong momentum even with nothing done yet today', () => {
    expect(deriveMood(input({ momentum: 70, todayCompletionRatio: 0 }))).toBe('happy')
  })

  it('returns sleepy on low momentum on a scheduled day', () => {
    expect(deriveMood(input({ momentum: 10, isRestDay: false }))).toBe('sleepy')
  })

  it('falls back to content in the unremarkable middle', () => {
    expect(deriveMood(input({ momentum: 40, todayCompletionRatio: 0 }))).toBe('content')
  })
})

describe('rule priority', () => {
  it('lets resting win over a state that would otherwise be thriving', () => {
    // Every thriving condition is met, but the user has been away — the
    // positively-framed resting mood must take precedence.
    expect(
      deriveMood(
        input({
          momentum: 100,
          todayCompletionRatio: 1,
          daysSinceLastActivity: MOOD_THRESHOLDS.RESTING_DAYS + 2,
        }),
      ),
    ).toBe('resting')
  })

  it('lets thriving win over happy when both match', () => {
    expect(deriveMood(input({ momentum: 95, todayCompletionRatio: 1 }))).toBe('thriving')
  })

  it('lets happy win over sleepy when a completion landed on a low-momentum day', () => {
    expect(deriveMood(input({ momentum: 5, todayCompletionRatio: 0.5 }))).toBe('happy')
  })

  it('derives the same mood as walking MOOD_RULES in order, across a full grid', () => {
    // Proves deriveMood is driven by the exported ordered rules rather than a
    // duplicated if-chain that could drift from them.
    for (const momentum of [0, 5, 24, 25, 40, 64, 65, 79, 80, 100]) {
      for (const todayCompletionRatio of [0, 0.5, 1]) {
        for (const daysSinceLastActivity of [0, 1, 3, 10]) {
          for (const isRestDay of [true, false]) {
            const candidate = input({
              momentum,
              todayCompletionRatio,
              daysSinceLastActivity,
              isRestDay,
            })
            const expected =
              MOOD_RULES.find((rule) => rule.when(candidate))?.mood ?? 'content'

            expect(deriveMood(candidate)).toBe(expected)
          }
        }
      }
    }
  })
})

describe('rest days are never punished', () => {
  it('never returns sleepy on a rest day, however low momentum is', () => {
    for (const momentum of [0, 1, 5, 10, 24]) {
      expect(deriveMood(input({ momentum, isRestDay: true }))).not.toBe('sleepy')
    }
  })

  it('returns content rather than sleepy on a low-momentum rest day', () => {
    expect(deriveMood(input({ momentum: 5, isRestDay: true }))).toBe('content')
  })

  it('still returns sleepy on the same momentum when the day is scheduled', () => {
    // The companion case: proves the rest-day guard is what changed the answer,
    // not the momentum value.
    expect(deriveMood(input({ momentum: 5, isRestDay: false }))).toBe('sleepy')
  })
})

describe('threshold boundaries', () => {
  it('needs momentum at or above THRIVING_MOMENTUM to thrive', () => {
    expect(
      deriveMood(
        input({
          momentum: MOOD_THRESHOLDS.THRIVING_MOMENTUM,
          todayCompletionRatio: 1,
        }),
      ),
    ).toBe('thriving')
    expect(
      deriveMood(
        input({
          momentum: MOOD_THRESHOLDS.THRIVING_MOMENTUM - 1,
          todayCompletionRatio: 1,
        }),
      ),
    ).toBe('happy')
  })

  it('needs a fully completed day to thrive, not just high momentum', () => {
    expect(deriveMood(input({ momentum: 100, todayCompletionRatio: 0.99 }))).toBe('happy')
  })

  it('turns happy at exactly HAPPY_MOMENTUM with nothing completed', () => {
    expect(deriveMood(input({ momentum: MOOD_THRESHOLDS.HAPPY_MOMENTUM }))).toBe('happy')
    expect(deriveMood(input({ momentum: MOOD_THRESHOLDS.HAPPY_MOMENTUM - 1 }))).toBe(
      'content',
    )
  })

  it('turns sleepy just below SLEEPY_MOMENTUM, not at it', () => {
    expect(deriveMood(input({ momentum: MOOD_THRESHOLDS.SLEEPY_MOMENTUM }))).toBe(
      'content',
    )
    expect(deriveMood(input({ momentum: MOOD_THRESHOLDS.SLEEPY_MOMENTUM - 1 }))).toBe(
      'sleepy',
    )
  })

  it('rests at exactly RESTING_DAYS, not the day before', () => {
    expect(
      deriveMood(input({ daysSinceLastActivity: MOOD_THRESHOLDS.RESTING_DAYS })),
    ).toBe('resting')
    expect(
      deriveMood(input({ daysSinceLastActivity: MOOD_THRESHOLDS.RESTING_DAYS - 1 })),
    ).toBe('content')
  })
})

describe('MOOD_RULES', () => {
  it('is ordered resting, thriving, happy, sleepy — priority is the contract', () => {
    expect(MOOD_RULES.map((rule) => rule.mood)).toEqual([
      'resting',
      'thriving',
      'happy',
      'sleepy',
    ])
  })
})
