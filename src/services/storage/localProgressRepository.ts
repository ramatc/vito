import type { UserProgress } from '../../types/models'
import { createDefaultUserProgress } from './defaults'
import { STORAGE_KEYS, isRecord, read, write } from './localStorageClient'
import type { ProgressRepository } from './repositories'

/**
 * Merging over the defaults rather than trusting the stored object outright
 * means a save written before a field existed still loads: the missing field
 * gets its first-run value instead of `undefined` leaking into the game maths.
 *
 * This is forward-compatibility for ADDED fields only, not a migration engine —
 * an incompatible reshape is handled by the schema marker (design §11).
 */
function parseProgress(raw: unknown): UserProgress | null {
  return isRecord(raw) ? { ...createDefaultUserProgress(), ...raw } : null
}

export function createLocalProgressRepository(): ProgressRepository {
  return {
    get: async () =>
      read(STORAGE_KEYS.progress, parseProgress, createDefaultUserProgress()),

    save: async (progress) => {
      write(STORAGE_KEYS.progress, progress)
    },
  }
}
