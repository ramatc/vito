import type {
  DateKey,
  Habit,
  HabitCompletion,
  UserProgress,
  VitoState,
} from '../../types/models'
import { createLocalCompletionRepository } from './localCompletionRepository'
import { createLocalHabitRepository } from './localHabitRepository'
import { createLocalProgressRepository } from './localProgressRepository'
import { createLocalVitoRepository } from './localVitoRepository'
import { clearAll, ensureSchemaVersion } from './localStorageClient'

/**
 * The public surface of the persistence layer.
 *
 * Stores depend on these interfaces, never on an implementation, a storage key
 * or `localStorage` itself. `createRepositories()` is the single swap point:
 * moving to a real backend means writing `SupabaseHabitRepository implements
 * HabitRepository` and changing one line below.
 */

export interface HabitRepository {
  getAll(): Promise<Habit[]>
  create(habit: Habit): Promise<void>
  update(id: string, patch: Partial<Habit>): Promise<void>
  /** Soft delete. The MVP never hard-deletes, so history stays intact. */
  archive(id: string, archivedAt: string): Promise<void>
}

export interface CompletionRepository {
  listByDate(date: DateKey): Promise<HabitCompletion[]>
  /** Both endpoints included. */
  listRange(from: DateKey, to: DateKey): Promise<HabitCompletion[]>
  add(completion: HabitCompletion): Promise<void>
  /** Un-checks a habit for a day. */
  removeByHabitAndDate(habitId: string, date: DateKey): Promise<void>
}

export interface ProgressRepository {
  get(): Promise<UserProgress>
  save(progress: UserProgress): Promise<void>
}

export interface VitoRepository {
  get(): Promise<VitoState>
  save(vito: VitoState): Promise<void>
}

/**
 * Four aggregates, not three. Completions are split out from habits because
 * they are an append-only log read by date range — a different access pattern
 * and, in any future backend, a different table. Nesting them under
 * `HabitRepository` would force that backend to fake a collection.
 */
export interface Repositories {
  habits: HabitRepository
  completions: CompletionRepository
  progress: ProgressRepository
  vito: VitoRepository
  /** Backs Settings > Reset Progress. Clears every key the app owns. */
  resetAll(): Promise<void>
}

export function createRepositories(): Repositories {
  ensureSchemaVersion()

  return {
    habits: createLocalHabitRepository(),
    completions: createLocalCompletionRepository(),
    progress: createLocalProgressRepository(),
    vito: createLocalVitoRepository(),
    resetAll: async () => {
      clearAll()
    },
  }
}

export type { StorageErrorHandler, StorageFailure } from './localStorageClient'
export { setStorageErrorHandler } from './localStorageClient'
