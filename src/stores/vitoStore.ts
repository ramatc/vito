import { create } from 'zustand'
import { COSMETIC_CATALOG } from '../domain/vito/cosmeticCatalog'
import type { UnlockProgress } from '../domain/vito/cosmetics'
import { computeUnlockedIds } from '../domain/vito/cosmetics'
import { createDefaultVitoState } from '../services/storage/defaults'
import type { CosmeticSlot, VitoState } from '../types/models'
import { getRepositories } from './repositories'
import type { StoreStatus } from './progressStore'

/**
 * Vito's persisted appearance: what is unlocked and what is worn.
 *
 * Mood and evolution stage are absent on purpose — both are derived from
 * progress on read (design §4), so they can never drift out of sync with it.
 */
export interface VitoStore {
  vito: VitoState
  status: StoreStatus
  load(): Promise<void>
  equip(slot: CosmeticSlot, itemId: string): Promise<void>
  unequip(slot: CosmeticSlot): Promise<void>
  /** Recomputes unlocks and returns only the ids that are newly earned. */
  syncUnlocks(progress: UnlockProgress): Promise<string[]>
  reset(): Promise<void>
}

export const useVitoStore = create<VitoStore>()((set, get) => {
  async function persist(vito: VitoState): Promise<void> {
    set({ vito })
    await getRepositories().vito.save(vito)
  }

  return {
    vito: createDefaultVitoState(),
    status: 'idle',

    load: async () => {
      set({ status: 'loading' })
      set({ vito: await getRepositories().vito.get(), status: 'ready' })
    },

    equip: async (slot, itemId) => {
      const vito = get().vito
      const item = COSMETIC_CATALOG.find((candidate) => candidate.id === itemId)

      // Silently ignores an item that does not exist, belongs to another slot,
      // or has not been earned. The closet only ever offers valid choices, so
      // reaching here means stale UI or edited saved data — neither is worth
      // throwing at the user over.
      if (
        item === undefined ||
        item.slot !== slot ||
        !vito.unlockedItemIds.includes(itemId)
      ) {
        return
      }

      await persist({ ...vito, equippedItems: { ...vito.equippedItems, [slot]: itemId } })
    },

    unequip: async (slot) => {
      const vito = get().vito
      const { [slot]: _removed, ...equippedItems } = vito.equippedItems

      await persist({ ...vito, equippedItems })
    },

    syncUnlocks: async (progress) => {
      const vito = get().vito
      const earned = computeUnlockedIds(COSMETIC_CATALOG, progress)
      const newlyUnlocked = earned.filter((id) => !vito.unlockedItemIds.includes(id))

      if (newlyUnlocked.length === 0) {
        return []
      }

      // Union rather than replace: an id earned under an older catalog or an
      // older balance stays earned. Unlocks are one-way.
      await persist({
        ...vito,
        unlockedItemIds: [...vito.unlockedItemIds, ...newlyUnlocked],
      })

      return newlyUnlocked
    },

    reset: async () => {
      await persist(createDefaultVitoState())
    },
  }
})
