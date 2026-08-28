import type { VitoState } from '../../types/models'
import { createDefaultVitoState } from './defaults'
import { STORAGE_KEYS, isRecord, read, write } from './localStorageClient'
import type { VitoRepository } from './repositories'

/**
 * Cosmetics only — mood and evolution stage are derived from progress and are
 * never stored (design §4).
 *
 * `equippedItems` is validated as a plain object and `unlockedItemIds` as an
 * array of strings, because both are read straight into render logic. An id
 * that no longer exists in the catalog is tolerated: `resolveLayers` skips it,
 * so saved data outlives catalog edits.
 */
function parseVitoState(raw: unknown): VitoState | null {
  if (!isRecord(raw)) {
    return null
  }

  const defaults = createDefaultVitoState()
  const equippedItems = isRecord(raw.equippedItems)
    ? raw.equippedItems
    : defaults.equippedItems
  const unlockedItemIds =
    Array.isArray(raw.unlockedItemIds) &&
    raw.unlockedItemIds.every((id) => typeof id === 'string')
      ? raw.unlockedItemIds
      : defaults.unlockedItemIds

  return { equippedItems, unlockedItemIds }
}

export function createLocalVitoRepository(): VitoRepository {
  return {
    get: async () => read(STORAGE_KEYS.vito, parseVitoState, createDefaultVitoState()),

    save: async (vito) => {
      write(STORAGE_KEYS.vito, vito)
    },
  }
}
