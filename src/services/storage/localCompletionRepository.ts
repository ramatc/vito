import type { HabitCompletion } from '../../types/models'
import { STORAGE_KEYS, parseIdentifiedList, read, write } from './localStorageClient'
import type { CompletionRepository } from './repositories'

/**
 * The completion log: append-only in practice, with un-checking as the single
 * removal path.
 *
 * Range queries are a linear scan over string comparison, which works because
 * `DateKey` is `YYYY-MM-DD` — lexicographic order is chronological order. Fine
 * for the thousands of rows an MVP profile accumulates; a real index is the
 * backend's job (design §11).
 */
function readAll(): HabitCompletion[] {
  return read(STORAGE_KEYS.completions, parseIdentifiedList<HabitCompletion>, [])
}

export function createLocalCompletionRepository(): CompletionRepository {
  return {
    listAll: async () => readAll(),

    listByDate: async (date) =>
      readAll().filter((completion) => completion.date === date),

    listRange: async (from, to) =>
      readAll().filter((completion) => completion.date >= from && completion.date <= to),

    add: async (completion) => {
      write(STORAGE_KEYS.completions, [...readAll(), completion])
    },

    removeByHabitAndDate: async (habitId, date) => {
      write(
        STORAGE_KEYS.completions,
        readAll().filter(
          (completion) => !(completion.habitId === habitId && completion.date === date),
        ),
      )
    },
  }
}
