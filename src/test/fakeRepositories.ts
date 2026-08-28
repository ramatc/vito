import {
  createDefaultUserProgress,
  createDefaultVitoState,
} from '../services/storage/defaults'
import type { Repositories } from '../services/storage/repositories'
import type { Habit, HabitCompletion, UserProgress, VitoState } from '../types/models'

/**
 * An in-memory `Repositories`, for tests that exercise the real stores.
 *
 * This is the payoff of the repository interfaces: the stores under test run
 * completely unmodified, with no mocking of localStorage, no jsdom quirks and
 * no partial doubles. `data` is exposed so a test can assert what was actually
 * persisted rather than only what the store kept in memory.
 */
export interface FakeSeed {
  habits?: Habit[]
  completions?: HabitCompletion[]
  progress?: Partial<UserProgress>
  vito?: Partial<VitoState>
}

export interface FakeRepositories {
  repos: Repositories
  data: {
    habits: Habit[]
    completions: HabitCompletion[]
    progress: UserProgress
    vito: VitoState
  }
}

export function createFakeRepositories(seed: FakeSeed = {}): FakeRepositories {
  const data: FakeRepositories['data'] = {
    habits: seed.habits ?? [],
    completions: seed.completions ?? [],
    progress: { ...createDefaultUserProgress(), ...seed.progress },
    vito: { ...createDefaultVitoState(), ...seed.vito },
  }

  const repos: Repositories = {
    habits: {
      // Copies on the way out, so a store mutating what it received cannot
      // reach back into the "database" and hide a missing write.
      getAll: async () => [...data.habits],
      create: async (habit) => {
        data.habits = [...data.habits, habit]
      },
      update: async (id, patch) => {
        data.habits = data.habits.map((entry) =>
          entry.id === id ? { ...entry, ...patch, id: entry.id } : entry,
        )
      },
      archive: async (id, archivedAt) => {
        data.habits = data.habits.map((entry) =>
          entry.id === id ? { ...entry, archivedAt } : entry,
        )
      },
    },
    completions: {
      listAll: async () => [...data.completions],
      listByDate: async (date) => data.completions.filter((entry) => entry.date === date),
      listRange: async (from, to) =>
        data.completions.filter((entry) => entry.date >= from && entry.date <= to),
      add: async (completion) => {
        data.completions = [...data.completions, completion]
      },
      removeByHabitAndDate: async (habitId, date) => {
        data.completions = data.completions.filter(
          (entry) => !(entry.habitId === habitId && entry.date === date),
        )
      },
    },
    progress: {
      get: async () => ({ ...data.progress }),
      save: async (progress) => {
        data.progress = { ...progress }
      },
    },
    vito: {
      get: async () => ({ ...data.vito }),
      save: async (vito) => {
        data.vito = { ...vito }
      },
    },
    resetAll: async () => {
      data.habits = []
      data.completions = []
      data.progress = createDefaultUserProgress()
      data.vito = createDefaultVitoState()
    },
  }

  return { repos, data }
}
