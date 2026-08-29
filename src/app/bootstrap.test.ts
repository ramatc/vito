import { beforeEach, describe, expect, it } from 'vitest'
import { COMEBACK } from '../domain/progression/comeback'
import { MOMENTUM } from '../domain/progression/momentum'
import { useHabitStore } from '../stores/habitStore'
import { useProgressStore } from '../stores/progressStore'
import { setRepositories } from '../stores/repositories'
import { useUiStore } from '../stores/uiStore'
import { useVitoStore } from '../stores/vitoStore'
import type { FakeSeed } from '../test/fakeRepositories'
import { createFakeRepositories } from '../test/fakeRepositories'
import type { Habit } from '../types/models'
import { resetAllData, runDayRollover } from './bootstrap'

/**
 * The rollover is the one piece of app logic that runs without a user action,
 * so its guard has to be right: charging a missed day twice, or letting the
 * comeback boost retrigger, are both invisible until someone's balance is wrong.
 */

const TODAY = '2026-03-10'

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

const progressNow = () => useProgressStore.getState().progress

beforeEach(() => {
  setRepositories(createFakeRepositories().repos)
  useUiStore.setState({ reaction: null })
})

describe('runDayRollover — idempotence', () => {
  it('stamps the rollover date on a first run and charges nothing', async () => {
    await boot()

    await runDayRollover(TODAY)

    expect(progressNow().lastRolloverDate).toBe(TODAY)
    expect(progressNow().momentum).toBe(MOMENTUM.START)
  })

  it('does not charge the same missed days twice when run again the same day', async () => {
    // Four missed scheduled days, one forgiven by the grace rule.
    await boot({
      progress: {
        momentum: 90,
        lastActivityDate: '2026-03-05',
        lastRolloverDate: '2026-03-05',
      },
    })

    await runDayRollover(TODAY)
    const afterFirst = progressNow().momentum
    await runDayRollover(TODAY)

    expect(afterFirst).toBeLessThan(90)
    expect(progressNow().momentum).toBe(afterFirst)
  })

  /**
   * A three-day absence also trips the comeback boost, whose recovery credit
   * would land on top of the debit being measured. These cases pin a recent
   * `lastComebackDate` so the cooldown suppresses it and the debit is isolated;
   * the combined behaviour is asserted in the comeback block below.
   */
  const comebackOnCooldown = { lastComebackDate: '2026-03-09' }

  it('debits momentum for fully missed scheduled days, minus the grace day', async () => {
    await boot({
      progress: {
        momentum: 90,
        lastActivityDate: '2026-03-07',
        lastRolloverDate: '2026-03-07',
        ...comebackOnCooldown,
      },
    })

    // Days strictly between 03-07 and 03-10 are 03-08 and 03-09: two missed
    // days on a daily habit, one of them forgiven.
    await runDayRollover(TODAY)

    expect(progressNow().momentum).toBe(90 - MOMENTUM.MISSED_DAY_DEBIT)
  })

  it('leaves momentum untouched when the missed days were rest days', async () => {
    await boot({
      habits: [habit({ frequency: { type: 'weekdays', days: [2] } })],
      progress: {
        momentum: 90,
        lastActivityDate: '2026-03-07',
        lastRolloverDate: '2026-03-07',
        ...comebackOnCooldown,
      },
    })

    await runDayRollover(TODAY)

    expect(progressNow().momentum).toBe(90)
  })

  it('never drops momentum below the floor, however long the absence', async () => {
    await boot({
      progress: {
        momentum: 20,
        lastActivityDate: '2026-01-01',
        lastRolloverDate: '2026-01-01',
        ...comebackOnCooldown,
      },
    })

    // Sixty-seven missed days at 8 apiece would take momentum deeply negative.
    // The floor is what stops Vito ever reading as dead.
    await runDayRollover(TODAY)

    expect(progressNow().momentum).toBe(MOMENTUM.MIN)
  })
})

describe('runDayRollover — the comeback boost', () => {
  const quietSince = (date: string): FakeSeed => ({
    progress: { lastActivityDate: date, lastRolloverDate: date },
  })

  it('triggers after the inactivity threshold and grants a boost', async () => {
    await boot(quietSince('2026-03-06')) // four days quiet

    await runDayRollover(TODAY)

    expect(progressNow().activeBoost).toMatchObject({
      remainingCompletions: COMEBACK.BONUS_COMPLETIONS,
      multiplier: COMEBACK.BONUS_MULTIPLIER,
    })
    expect(progressNow().lastComebackDate).toBe(TODAY)
  })

  it('credits momentum recovery when it triggers', async () => {
    await boot({ progress: { momentum: 40, ...quietSince('2026-03-06').progress } })

    await runDayRollover(TODAY)

    // The missed days are debited first, then the recovery credit is added.
    const debited = 40 - 2 * MOMENTUM.MISSED_DAY_DEBIT
    expect(progressNow().momentum).toBe(debited + COMEBACK.MOMENTUM_RECOVERY_CREDIT)
  })

  it('does not trigger below the inactivity threshold', async () => {
    await boot(quietSince('2026-03-09')) // one day quiet

    await runDayRollover(TODAY)

    expect(progressNow().activeBoost).toBeNull()
  })

  it('does not retrigger inside the cooldown window', async () => {
    await boot({
      progress: {
        lastActivityDate: '2026-03-06',
        lastRolloverDate: '2026-03-06',
        lastComebackDate: '2026-03-06',
      },
    })

    await runDayRollover(TODAY)

    expect(progressNow().activeBoost).toBeNull()
  })

  it('triggers again once the cooldown has elapsed', async () => {
    await boot({
      progress: {
        lastActivityDate: '2026-03-06',
        lastRolloverDate: '2026-03-06',
        lastComebackDate: '2026-03-03', // exactly COOLDOWN_DAYS before today
      },
    })

    await runDayRollover(TODAY)

    expect(progressNow().activeBoost).not.toBeNull()
  })

  it('does not trigger for a profile that has never completed anything', async () => {
    await boot()

    await runDayRollover(TODAY)

    expect(progressNow().activeBoost).toBeNull()
  })
})

/**
 * The comeback is design §10's "welcome back" moment, and the rollover is the
 * only place in the app that knows it happened. Without this the `wake` variant
 * has no producer at all: `useCompleteHabit` only ever emits `celebrate`,
 * `levelUp` or `unlock`.
 */
describe('runDayRollover — the welcome-back reaction', () => {
  const reactionNow = () => useUiStore.getState().reaction

  it('emits wake when the comeback triggers', async () => {
    await boot({
      progress: { lastActivityDate: '2026-03-06', lastRolloverDate: '2026-03-06' },
    })

    await runDayRollover(TODAY)

    expect(reactionNow()?.type).toBe('wake')
  })

  it('emits nothing on an ordinary day', async () => {
    await boot({
      progress: { lastActivityDate: '2026-03-09', lastRolloverDate: '2026-03-09' },
    })

    await runDayRollover(TODAY)

    expect(reactionNow()).toBeNull()
  })

  it('emits nothing when the cooldown suppresses the comeback', async () => {
    await boot({
      progress: {
        lastActivityDate: '2026-03-06',
        lastRolloverDate: '2026-03-06',
        lastComebackDate: '2026-03-06',
      },
    })

    await runDayRollover(TODAY)

    expect(reactionNow()).toBeNull()
  })

  it('emits nothing on the second run of the same day', async () => {
    await boot({
      progress: { lastActivityDate: '2026-03-06', lastRolloverDate: '2026-03-06' },
    })

    await runDayRollover(TODAY)
    useUiStore.setState({ reaction: null })
    await runDayRollover(TODAY)

    expect(reactionNow()).toBeNull()
  })
})

/**
 * Reset is the one irreversible thing the app can do (design §11 accepts that
 * for the MVP), so it has to be complete: a wipe that leaves one aggregate
 * behind would resurrect old habits or old XP on the next reload.
 */
describe('resetAllData', () => {
  const seeded = async () =>
    boot({
      completions: [
        {
          id: 'completion-1',
          habitId: 'habit-read',
          date: '2026-03-09',
          xpAwarded: 20,
          completedAt: '2026-03-09T08:00:00.000Z',
        },
      ],
      progress: {
        totalXp: 900,
        momentum: 80,
        currentStreak: 4,
        longestStreak: 9,
        lastActivityDate: '2026-03-09',
        lastRolloverDate: '2026-03-09',
      },
      vito: {
        equippedItems: { hat: 'hat-sprout' },
        unlockedItemIds: ['hat-sprout'],
      },
    })

  it('clears every stored aggregate', async () => {
    const fake = await seeded()

    await resetAllData()

    expect(fake.data.habits).toEqual([])
    expect(fake.data.completions).toEqual([])
    expect(fake.data.progress.totalXp).toBe(0)
    expect(fake.data.vito.unlockedItemIds).toEqual([])
  })

  it('rehydrates the stores to first-run defaults', async () => {
    await seeded()

    await resetAllData()

    expect(useHabitStore.getState().habits).toEqual([])
    expect(useHabitStore.getState().completions).toEqual([])
    expect(progressNow().totalXp).toBe(0)
    expect(progressNow().momentum).toBe(MOMENTUM.START)
    expect(progressNow().currentStreak).toBe(0)
    expect(progressNow().longestStreak).toBe(0)
    expect(progressNow().lastActivityDate).toBeNull()
    expect(useVitoStore.getState().vito.equippedItems).toEqual({})
    expect(useVitoStore.getState().vito.unlockedItemIds).toEqual([])
  })

  it('leaves every store readable, not stuck loading', async () => {
    await seeded()

    await resetAllData()

    expect(useHabitStore.getState().status).toBe('ready')
    expect(useProgressStore.getState().status).toBe('ready')
    expect(useVitoStore.getState().status).toBe('ready')
  })
})
