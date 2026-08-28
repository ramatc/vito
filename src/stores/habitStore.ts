import { create } from 'zustand'
import { countMissedScheduledDays, isScheduledOn } from '../domain/habit/schedule'
import { xpRewardFor } from '../domain/habit/xpReward'
import type { EvolutionStage } from '../domain/vito/evolution'
import { getEvolutionStage } from '../domain/vito/evolution'
import type { DateKey, Habit, HabitCompletion } from '../types/models'
import { newId } from '../utils/id'
import type { StoreStatus } from './progressStore'
import { useProgressStore } from './progressStore'
import { getRepositories } from './repositories'
import { useVitoStore } from './vitoStore'

/**
 * Habits and their completion log — and the app's single cross-aggregate
 * transaction, `completeHabit`.
 *
 * This is the only place where stores call each other. Everything else stays a
 * one-way street: a component asks a store, a store asks the domain and the
 * repositories.
 */

/** What `createHabit` needs; identity and timestamps are the store's job. */
export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'archivedAt'>

/** Habit edits are forward-only: identity and creation time are not editable. */
export type HabitPatch = Partial<Omit<Habit, 'id' | 'createdAt'>>

/**
 * The result of one completion, as plain data.
 *
 * Deliberately free of animation names, copy and toast shapes. `habitStore`
 * reports what HAPPENED; the hooks layer decides what that should look like.
 * That split is what lets the whole game engine be tested without a UI.
 */
export interface CompletionOutcome {
  xpGained: number
  boosted: boolean
  momentumDelta: number
  leveledUp: boolean
  newLevel: number
  stageChanged: boolean
  newStage: EvolutionStage
  unlockedItemIds: string[]
}

export interface HabitStore {
  habits: Habit[]
  completions: HabitCompletion[]
  status: StoreStatus
  load(): Promise<void>
  createHabit(draft: HabitDraft): Promise<Habit>
  updateHabit(id: string, patch: HabitPatch): Promise<void>
  archiveHabit(id: string, archivedAt?: string): Promise<void>
  /**
   * Records a completion and applies every consequence.
   *
   * Returns `null` when nothing happened — the habit is unknown, is not
   * scheduled today, or was already completed today. A null result is a no-op,
   * not an error: tapping twice is something users do, and it should be quiet.
   */
  completeHabit(habitId: string, today: DateKey): Promise<CompletionOutcome | null>
  undoCompletion(habitId: string, today: DateKey): Promise<void>
  reset(): Promise<void>
}

/**
 * Habit ids with a `completeHabit` call currently in flight.
 *
 * Module scope rather than store state: this is a synchronous re-entrancy
 * guard, not something a component ever renders from, and giving it its own
 * `set` would trigger a re-render for no observer. Two overlapping calls for
 * the same habit (a rapid double-tap) both read `alreadyDone` as false before
 * either await settles, so the `completions` check alone cannot stop a double
 * award — this closes that window.
 */
const inFlightCompletions = new Set<string>()

export const useHabitStore = create<HabitStore>()((set, get) => ({
  habits: [],
  completions: [],
  status: 'idle',

  load: async () => {
    const repos = getRepositories()
    set({ status: 'loading' })

    const [habits, completions] = await Promise.all([
      repos.habits.getAll(),
      // The whole log. Fine at MVP volume; paging is the backend's problem
      // (design §11).
      repos.completions.listAll(),
    ])

    set({ habits, completions, status: 'ready' })
  },

  createHabit: async (draft) => {
    const habit: Habit = { ...draft, id: newId(), createdAt: new Date().toISOString() }

    await getRepositories().habits.create(habit)
    set({ habits: [...get().habits, habit] })

    return habit
  },

  updateHabit: async (id, patch) => {
    await getRepositories().habits.update(id, patch)
    set({
      habits: get().habits.map((habit) =>
        habit.id === id ? { ...habit, ...patch, id: habit.id } : habit,
      ),
    })
  },

  archiveHabit: async (id, archivedAt = new Date().toISOString()) => {
    await getRepositories().habits.archive(id, archivedAt)
    set({
      habits: get().habits.map((habit) =>
        habit.id === id ? { ...habit, archivedAt } : habit,
      ),
    })
  },

  completeHabit: async (habitId, today) => {
    // Checked and set synchronously, before any `await`: this is what makes it
    // a real guard against two overlapping calls rather than another read of
    // state that both callers could pass at once.
    if (inFlightCompletions.has(habitId)) {
      return null
    }

    inFlightCompletions.add(habitId)

    try {
      const { habits, completions } = get()
      const habit = habits.find((candidate) => candidate.id === habitId)

      if (habit === undefined || !isScheduledOn(habit, today)) {
        return null
      }

      const alreadyDone = completions.some(
        (completion) => completion.habitId === habitId && completion.date === today,
      )

      if (alreadyDone) {
        return null
      }

      const progressStore = useProgressStore.getState()
      const lastActivityDate = progressStore.progress.lastActivityDate

      // Only this store knows what was scheduled, so it is the one that can tell
      // the progression layer how many scheduled days were fully missed since the
      // last activity. Rest days are excluded by the domain function, which is
      // what keeps them neutral for streaks.
      const missedScheduledDays =
        lastActivityDate === null
          ? 0
          : countMissedScheduledDays({
              habits,
              completions,
              from: lastActivityDate,
              to: today,
            })

      const delta = await progressStore.registerCompletion({
        baseXp: xpRewardFor(habit.difficulty),
        today,
        missedScheduledDays,
      })

      // The snapshot is the XP actually awarded, boost included. History is
      // immutable: retuning difficulty later must never rewrite this number.
      const completion: HabitCompletion = {
        id: newId(),
        habitId,
        date: today,
        xpAwarded: delta.xpGained,
        completedAt: new Date().toISOString(),
      }

      await getRepositories().completions.add(completion)
      set({ completions: [...get().completions, completion] })

      const unlockedItemIds = await useVitoStore.getState().syncUnlocks({
        level: delta.newLevel,
        totalXp: useProgressStore.getState().progress.totalXp,
        longestStreak: useProgressStore.getState().progress.longestStreak,
      })

      const previousStage = getEvolutionStage(delta.previousLevel)
      const newStage = getEvolutionStage(delta.newLevel)

      return {
        xpGained: delta.xpGained,
        boosted: delta.boosted,
        momentumDelta: delta.momentumDelta,
        leveledUp: delta.leveledUp,
        newLevel: delta.newLevel,
        stageChanged: newStage !== previousStage,
        newStage,
        unlockedItemIds,
      }
    } finally {
      inFlightCompletions.delete(habitId)
    }
  },

  undoCompletion: async (habitId, today) => {
    const completion = get().completions.find(
      (entry) => entry.habitId === habitId && entry.date === today,
    )

    if (completion === undefined) {
      return
    }

    await getRepositories().completions.removeByHabitAndDate(habitId, today)
    set({
      completions: get().completions.filter(
        (entry) => !(entry.habitId === habitId && entry.date === today),
      ),
    })

    // The snapshot on the record is what makes an exact refund possible — the
    // habit's difficulty may have changed since it was earned.
    await useProgressStore.getState().revokeCompletion(completion.xpAwarded)
  },

  reset: async () => {
    set({ habits: [], completions: [], status: 'ready' })
  },
}))
