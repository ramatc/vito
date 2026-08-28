import { create } from 'zustand'
import { applyComebackToXp, startComeback } from '../domain/progression/comeback'
import {
  applyComebackRecovery,
  applyCompletionCredit,
  rollOverMomentum,
} from '../domain/progression/momentum'
import { updateStreak } from '../domain/progression/streak'
import { calculateLevel } from '../domain/progression/xp'
import { createDefaultUserProgress } from '../services/storage/defaults'
import type { DateKey, UserProgress } from '../types/models'
import { getRepositories } from './repositories'

/**
 * The progression aggregate: XP, momentum, streak and the comeback boost.
 *
 * Every number here is produced by a `domain/` function. The store's job is
 * sequencing and persistence, not game balance — retuning the game must never
 * mean editing a store.
 */

export type StoreStatus = 'idle' | 'loading' | 'ready'

/** What one completion did, for the UI to react to. */
export interface ProgressDelta {
  /** XP actually awarded, after any comeback multiplier. */
  xpGained: number
  boosted: boolean
  momentumDelta: number
  leveledUp: boolean
  previousLevel: number
  newLevel: number
}

export interface RegisterCompletionInput {
  baseXp: number
  today: DateKey
  /**
   * Fully-missed scheduled days between the last activity and today. Supplied
   * by the caller because habits and completions live in `habitStore` — this
   * store has no way to work out what was scheduled.
   */
  missedScheduledDays: number
}

export interface ProgressStore {
  progress: UserProgress
  status: StoreStatus
  load(): Promise<void>
  registerCompletion(input: RegisterCompletionInput): Promise<ProgressDelta>
  /** Gives back exactly the XP a completion awarded, when it is un-checked. */
  revokeCompletion(xpAwarded: number): Promise<void>
  rollOverDay(input: {
    today: DateKey
    missedScheduledDays: number
    hadActivityBefore: boolean
  }): Promise<void>
  startComeback(today: DateKey): Promise<void>
  reset(): Promise<void>
}

export const useProgressStore = create<ProgressStore>()((set, get) => {
  async function persist(progress: UserProgress): Promise<void> {
    set({ progress })
    await getRepositories().progress.save(progress)
  }

  return {
    progress: createDefaultUserProgress(),
    status: 'idle',

    load: async () => {
      set({ status: 'loading' })
      set({ progress: await getRepositories().progress.get(), status: 'ready' })
    },

    registerCompletion: async ({ baseXp, today, missedScheduledDays }) => {
      const progress = get().progress

      // The boost is read before it is spent, because `applyComebackToXp`
      // returns null both when a boost was exhausted and when there never was
      // one — the caller could not tell "boosted" from "not boosted" afterwards.
      const boosted =
        progress.activeBoost !== null && progress.activeBoost.remainingCompletions > 0
      const award = applyComebackToXp(baseXp, progress.activeBoost)

      // A new day starts with the full daily allowance.
      const creditedToday =
        progress.momentumCredit.date === today ? progress.momentumCredit.amount : 0
      const momentum = applyCompletionCredit({
        momentum: progress.momentum,
        creditedToday,
      })

      const streak = updateStreak(progress, {
        today,
        completedToday: true,
        missedScheduledDays,
      })

      const totalXp = progress.totalXp + award.xp
      const previousLevel = calculateLevel(progress.totalXp)
      const newLevel = calculateLevel(totalXp)

      await persist({
        ...progress,
        totalXp,
        momentum: momentum.momentum,
        momentumCredit: { date: today, amount: momentum.creditedToday },
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate,
        activeBoost: award.boost,
      })

      return {
        xpGained: award.xp,
        boosted,
        momentumDelta: momentum.delta,
        leveledUp: newLevel > previousLevel,
        previousLevel,
        newLevel,
      }
    },

    revokeCompletion: async (xpAwarded) => {
      const progress = get().progress

      // XP is clawed back because it is the farmable resource: without this,
      // un-checking and re-checking a habit would award it again and again.
      //
      // Momentum and streak are deliberately NOT rewound. Both are already
      // bounded per day (the credit cap, and one streak increment per calendar
      // day), so neither can be farmed, and rewinding a streak because someone
      // fixed a mis-tap would punish a correction. The spent comeback
      // completion is not restored for the same reason — it costs the user, not
      // the system.
      await persist({ ...progress, totalXp: Math.max(progress.totalXp - xpAwarded, 0) })
    },

    rollOverDay: async ({ today, missedScheduledDays, hadActivityBefore }) => {
      const progress = get().progress
      const momentum = rollOverMomentum({
        momentum: progress.momentum,
        missedScheduledDays,
        hadActivityBefore,
      })
      const streak = updateStreak(progress, {
        today,
        completedToday: false,
        missedScheduledDays,
      })

      await persist({
        ...progress,
        momentum: momentum.momentum,
        momentumCredit: { date: today, amount: 0 },
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate,
        lastRolloverDate: today,
      })
    },

    startComeback: async (today) => {
      const progress = get().progress

      await persist({
        ...progress,
        momentum: applyComebackRecovery(progress.momentum),
        lastComebackDate: today,
        activeBoost: startComeback(today),
      })
    },

    reset: async () => {
      await persist(createDefaultUserProgress())
    },
  }
})
