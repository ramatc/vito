import type { Habit } from '../../types/models'
import { STORAGE_KEYS, parseIdentifiedList, read, write } from './localStorageClient'
import type { HabitRepository } from './repositories'

/**
 * Habits, stored as one JSON array under a single key.
 *
 * Read-modify-write on every mutation is the right trade at MVP volume: a
 * profile holds tens of habits, and one key keeps the whole collection
 * atomically consistent instead of spreading it over per-id keys that can end
 * up half-written.
 */
function readAll(): Habit[] {
  return read(STORAGE_KEYS.habits, parseIdentifiedList<Habit>, [])
}

export function createLocalHabitRepository(): HabitRepository {
  return {
    getAll: async () => readAll(),

    create: async (habit) => {
      write(STORAGE_KEYS.habits, [...readAll(), habit])
    },

    update: async (id, patch) => {
      write(
        STORAGE_KEYS.habits,
        readAll().map((habit) =>
          // `id` is restored after the patch so a caller can hand over a whole
          // form object without being able to re-point the record at another
          // habit, which would orphan every completion tied to this one.
          habit.id === id ? { ...habit, ...patch, id: habit.id } : habit,
        ),
      )
    },

    archive: async (id, archivedAt) => {
      write(
        STORAGE_KEYS.habits,
        readAll().map((habit) => (habit.id === id ? { ...habit, archivedAt } : habit)),
      )
    },
  }
}
