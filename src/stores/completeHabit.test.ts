import { beforeEach, describe, expect, it } from 'vitest'
import { xpRewardFor } from '../domain/habit/xpReward'
import { COMEBACK } from '../domain/progression/comeback'
import { MOMENTUM } from '../domain/progression/momentum'
import { xpThresholdForLevel } from '../domain/progression/xp'
import { COSMETIC_CATALOG } from '../domain/vito/cosmeticCatalog'
import type { FakeSeed } from '../test/fakeRepositories'
import { createFakeRepositories } from '../test/fakeRepositories'
import type { Habit } from '../types/models'
import { useHabitStore } from './habitStore'
import { useProgressStore } from './progressStore'
import { setRepositories } from './repositories'
import { useVitoStore } from './vitoStore'

/**
 * `completeHabit` is the only cross-aggregate transaction in the app, so it is
 * the one place where an integration test earns its keep: the real stores run
 * against an in-memory `Repositories`, which is exactly the swap the interface
 * exists to make trivial. Nothing is mocked — every number below comes from the
 * real domain functions.
 */

const TODAY = '2026-03-10' // a Tuesday
const NORMAL_XP = xpRewardFor('normal')

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-read',
    name: 'Read',
    icon: 'book',
    category: 'Mind',
    frequency: { type: 'daily' },
    difficulty: 'normal',
    createdAt: '2026-01-01T08:00:00.000Z',
    ...overrides,
  }
}

async function boot(seed: FakeSeed = {}) {
  const fake = createFakeRepositories({ habits: [habit()], ...seed })
  setRepositories(fake.repos)

  await Promise.all([
    useHabitStore.getState().load(),
    useProgressStore.getState().load(),
    useVitoStore.getState().load(),
  ])

  return fake
}

const complete = (habitId = 'habit-read', today = TODAY) =>
  useHabitStore.getState().completeHabit(habitId, today)

const progressNow = () => useProgressStore.getState().progress

beforeEach(() => {
  setRepositories(createFakeRepositories().repos)
})

describe('completeHabit — the happy path', () => {
  it('awards the habit difficulty XP and credits momentum', async () => {
    await boot()

    const outcome = await complete()

    expect(outcome).toMatchObject({
      xpGained: NORMAL_XP,
      boosted: false,
      momentumDelta: MOMENTUM.COMPLETION_CREDIT,
      leveledUp: false,
      newLevel: 1,
      stageChanged: false,
      newStage: 1,
      unlockedItemIds: [],
    })
    expect(progressNow().totalXp).toBe(NORMAL_XP)
    expect(progressNow().momentum).toBe(MOMENTUM.START + MOMENTUM.COMPLETION_CREDIT)
  })

  it('starts the streak at 1 and records today as the last activity', async () => {
    await boot()

    await complete()

    expect(progressNow()).toMatchObject({
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: TODAY,
    })
  })

  it('persists a completion carrying the XP actually awarded', async () => {
    const fake = await boot()

    await complete()

    expect(fake.data.completions).toHaveLength(1)
    expect(fake.data.completions[0]).toMatchObject({
      habitId: 'habit-read',
      date: TODAY,
      xpAwarded: NORMAL_XP,
    })
  })

  it('persists the new progress, so a reload keeps the XP', async () => {
    const fake = await boot()

    await complete()

    expect(fake.data.progress.totalXp).toBe(NORMAL_XP)
  })

  it('exposes the completion in store state without a reload', async () => {
    await boot()

    await complete()

    expect(useHabitStore.getState().completions.map((entry) => entry.habitId)).toEqual([
      'habit-read',
    ])
  })
})

describe('completeHabit — completing twice in one day', () => {
  it('returns null the second time instead of awarding XP again', async () => {
    await boot()

    const first = await complete()
    const second = await complete()

    expect(first).not.toBeNull()
    expect(second).toBeNull()
  })

  it('leaves XP, momentum and streak exactly where the first completion left them', async () => {
    await boot()
    await complete()
    const afterFirst = { ...progressNow() }

    await complete()

    expect(progressNow()).toEqual(afterFirst)
  })

  it('records only one completion', async () => {
    const fake = await boot()

    await complete()
    await complete()

    expect(fake.data.completions).toHaveLength(1)
  })
})

describe('completeHabit — overlapping calls for the same habit', () => {
  // A rapid double-tap fires both calls before either has awaited anything,
  // so both would read `alreadyDone` as false without the in-flight guard —
  // this is the race the store-level guard in `completeHabit` closes.
  it('awards XP only once when two calls race before either settles', async () => {
    const fake = await boot()

    const [first, second] = await Promise.all([complete(), complete()])

    const outcomes = [first, second]
    expect(outcomes.filter((outcome) => outcome !== null)).toHaveLength(1)
    expect(fake.data.completions).toHaveLength(1)
    expect(progressNow().totalXp).toBe(NORMAL_XP)
  })
})

describe('completeHabit — when the habit is not completable', () => {
  it('returns null for a habit that is not scheduled today', async () => {
    // 2026-03-10 is a Tuesday (weekday 2); this habit is Monday-only.
    await boot({ habits: [habit({ frequency: { type: 'weekdays', days: [1] } })] })

    await expect(complete()).resolves.toBeNull()
    expect(progressNow().totalXp).toBe(0)
  })

  it('returns null for an archived habit', async () => {
    await boot({ habits: [habit({ archivedAt: '2026-03-01T09:00:00.000Z' })] })

    await expect(complete()).resolves.toBeNull()
  })

  it('returns null for an unknown habit id', async () => {
    await boot()

    await expect(complete('does-not-exist')).resolves.toBeNull()
  })

  it('still completes a weekday habit on a day it IS scheduled', async () => {
    // Triangulates the schedule guard: same habit, a day it is due.
    await boot({ habits: [habit({ frequency: { type: 'weekdays', days: [2] } })] })

    await expect(complete()).resolves.not.toBeNull()
    expect(progressNow().totalXp).toBe(NORMAL_XP)
  })
})

describe('completeHabit — levelling and evolution', () => {
  it('reports a level-up when the completion crosses the threshold', async () => {
    await boot({ progress: { totalXp: xpThresholdForLevel(2) - NORMAL_XP } })

    const outcome = await complete()

    expect(outcome).toMatchObject({ leveledUp: true, newLevel: 2, stageChanged: false })
  })

  it('reports a stage change when the level-up crosses an evolution bracket', async () => {
    // Level 4 is the first bracket boundary: stage 1 -> 2.
    await boot({ progress: { totalXp: xpThresholdForLevel(4) - NORMAL_XP } })

    const outcome = await complete()

    expect(outcome).toMatchObject({
      leveledUp: true,
      newLevel: 4,
      stageChanged: true,
      newStage: 2,
    })
  })

  it('reports no level-up one XP short of the threshold', async () => {
    await boot({ progress: { totalXp: xpThresholdForLevel(2) - NORMAL_XP - 1 } })

    const outcome = await complete()

    expect(outcome).toMatchObject({ leveledUp: false, newLevel: 1 })
  })
})

describe('completeHabit — the comeback boost', () => {
  it('multiplies the award and marks the outcome boosted', async () => {
    await boot({
      progress: {
        activeBoost: {
          remainingCompletions: COMEBACK.BONUS_COMPLETIONS,
          multiplier: COMEBACK.BONUS_MULTIPLIER,
          triggeredOn: '2026-03-09',
        },
      },
    })

    const outcome = await complete()

    expect(outcome).toMatchObject({
      xpGained: Math.round(NORMAL_XP * COMEBACK.BONUS_MULTIPLIER),
      boosted: true,
    })
  })

  it('spends one completion off the boost', async () => {
    await boot({
      progress: {
        activeBoost: {
          remainingCompletions: COMEBACK.BONUS_COMPLETIONS,
          multiplier: COMEBACK.BONUS_MULTIPLIER,
          triggeredOn: '2026-03-09',
        },
      },
    })

    await complete()

    expect(progressNow().activeBoost?.remainingCompletions).toBe(
      COMEBACK.BONUS_COMPLETIONS - 1,
    )
  })

  it('persists the boosted XP as the completion snapshot', async () => {
    const fake = await boot({
      progress: {
        activeBoost: {
          remainingCompletions: 1,
          multiplier: COMEBACK.BONUS_MULTIPLIER,
          triggeredOn: '2026-03-09',
        },
      },
    })

    await complete()

    expect(fake.data.completions[0].xpAwarded).toBe(
      Math.round(NORMAL_XP * COMEBACK.BONUS_MULTIPLIER),
    )
    expect(progressNow().activeBoost).toBeNull()
  })
})

describe('completeHabit — the daily momentum cap', () => {
  it('stops crediting momentum once the daily cap is spent', async () => {
    const many = Array.from({ length: 5 }, (_, index) => habit({ id: `habit-${index}` }))
    await boot({ habits: many })

    const deltas: number[] = []
    for (const entry of many) {
      const outcome = await complete(entry.id)
      deltas.push(outcome?.momentumDelta ?? -1)
    }

    const credit = MOMENTUM.COMPLETION_CREDIT
    const capped = MOMENTUM.DAILY_CREDIT_CAP / credit
    expect(deltas.slice(0, capped)).toEqual(Array<number>(capped).fill(credit))
    expect(deltas.slice(capped)).toEqual(Array<number>(many.length - capped).fill(0))
    expect(progressNow().momentum).toBe(MOMENTUM.START + MOMENTUM.DAILY_CREDIT_CAP)
  })

  it('only counts one habit toward the streak no matter how many are completed', async () => {
    const many = [habit({ id: 'a' }), habit({ id: 'b' })]
    await boot({ habits: many })

    await complete('a')
    await complete('b')

    expect(progressNow().currentStreak).toBe(1)
  })
})

describe('completeHabit — streaks across missed days', () => {
  it('extends the streak when the previous scheduled day was completed', async () => {
    await boot({
      completions: [
        {
          id: 'c1',
          habitId: 'habit-read',
          date: '2026-03-09',
          xpAwarded: NORMAL_XP,
          completedAt: '2026-03-09T09:00:00.000Z',
        },
      ],
      progress: { currentStreak: 4, longestStreak: 6, lastActivityDate: '2026-03-09' },
    })

    await complete()

    expect(progressNow()).toMatchObject({ currentStreak: 5, longestStreak: 6 })
  })

  it('restarts the streak at 1 after a fully missed scheduled day', async () => {
    await boot({
      progress: { currentStreak: 4, longestStreak: 6, lastActivityDate: '2026-03-07' },
    })

    await complete()

    expect(progressNow()).toMatchObject({ currentStreak: 1, longestStreak: 6 })
  })

  it('keeps the streak alive across rest days the habit was not scheduled for', async () => {
    // Saturday-and-Tuesday habit. Between the last activity (Sat 2026-03-07)
    // and today (Tue 2026-03-10) sit Sunday and Monday, neither of them due —
    // rest days are neutral, so the streak neither breaks nor pauses.
    await boot({
      habits: [habit({ frequency: { type: 'weekdays', days: [2, 6] } })],
      progress: { currentStreak: 4, longestStreak: 6, lastActivityDate: '2026-03-07' },
    })

    await complete()

    expect(progressNow().currentStreak).toBe(5)
  })
})

describe('completeHabit — cosmetic unlocks', () => {
  it('reports an item newly unlocked by the XP this completion awarded', async () => {
    const aura = COSMETIC_CATALOG.find((item) => item.id === 'aura-glow')!
    await boot({
      progress: { totalXp: aura.unlockRequirement.value - NORMAL_XP },
      // That much XP is level 8, so the level-4 hat is long since earned.
      // Seeding it as already recorded isolates the aura as the ONLY new unlock.
      vito: { unlockedItemIds: ['hat-sprout'] },
    })

    const outcome = await complete()

    expect(outcome?.unlockedItemIds).toEqual(['aura-glow'])
    expect(useVitoStore.getState().vito.unlockedItemIds).toContain('aura-glow')
  })

  it('does not report an item that was already unlocked', async () => {
    const aura = COSMETIC_CATALOG.find((item) => item.id === 'aura-glow')!
    await boot({
      progress: { totalXp: aura.unlockRequirement.value },
      vito: { unlockedItemIds: ['hat-sprout', 'aura-glow'] },
    })

    const outcome = await complete()

    expect(outcome?.unlockedItemIds).toEqual([])
  })

  it('backfills an item that was earned but never recorded', async () => {
    // A save whose unlocks fell behind the balance — the level-4 hat is earned
    // by the seeded XP but absent from the record. The next completion catches
    // it up rather than leaving it permanently locked.
    await boot({ progress: { totalXp: xpThresholdForLevel(4) } })

    const outcome = await complete()

    expect(outcome?.unlockedItemIds).toEqual(['hat-sprout'])
  })
})

describe('undoCompletion', () => {
  it('removes the completion record', async () => {
    const fake = await boot()
    await complete()

    await useHabitStore.getState().undoCompletion('habit-read', TODAY)

    expect(fake.data.completions).toEqual([])
    expect(useHabitStore.getState().completions).toEqual([])
  })

  it('refunds exactly the XP that completion awarded', async () => {
    await boot({ progress: { totalXp: 200 } })
    await complete()

    await useHabitStore.getState().undoCompletion('habit-read', TODAY)

    expect(progressNow().totalXp).toBe(200)
  })

  it('refunds the boosted amount, not the base amount', async () => {
    await boot({
      progress: {
        totalXp: 200,
        activeBoost: {
          remainingCompletions: 1,
          multiplier: COMEBACK.BONUS_MULTIPLIER,
          triggeredOn: '2026-03-09',
        },
      },
    })
    await complete()

    await useHabitStore.getState().undoCompletion('habit-read', TODAY)

    expect(progressNow().totalXp).toBe(200)
  })

  it('lets the habit be completed again afterwards, without double-awarding', async () => {
    await boot()
    await complete()
    await useHabitStore.getState().undoCompletion('habit-read', TODAY)

    await complete()

    expect(progressNow().totalXp).toBe(NORMAL_XP)
  })

  it('does nothing when there is no completion to undo', async () => {
    await boot({ progress: { totalXp: 200 } })

    await useHabitStore.getState().undoCompletion('habit-read', TODAY)

    expect(progressNow().totalXp).toBe(200)
  })
})
