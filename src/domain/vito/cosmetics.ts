import type { CosmeticItem, CosmeticSlot, EquippedItems } from '../../types/models'

/**
 * Cosmetic layering and unlocking.
 *
 * Both are pure lookups over the catalog. There is no randomness in this
 * system: `rarity` is a display tier the closet UI reads, and nothing here ever
 * consults it.
 */

/** Back to front. The base evolution sprite sits behind all of these, at z 0. */
export const SLOT_RENDER_ORDER: readonly CosmeticSlot[] = ['aura', 'backpack', 'hat']

export interface CosmeticLayer {
  slot: CosmeticSlot
  itemId: string
  /** Key the UI layer resolves to a component. */
  assetRef: string
  z: number
}

/** Progress values every unlock requirement is measured against. */
export interface UnlockProgress {
  level: number
  totalXp: number
  longestStreak: number
}

/**
 * The equipped cosmetics as ordered render layers.
 *
 * `z` comes from the slot's fixed position in `SLOT_RENDER_ORDER`, not from the
 * position in the returned array, so a hat keeps its depth whether or not an
 * aura is equipped behind it.
 *
 * An id that is missing from the catalog, or saved into the wrong slot, is
 * skipped rather than thrown on: saved data outlives catalog edits.
 */
export function resolveLayers(
  equipped: EquippedItems,
  catalog: readonly CosmeticItem[],
): CosmeticLayer[] {
  return SLOT_RENDER_ORDER.flatMap((slot, index) => {
    const itemId = equipped[slot]

    if (itemId === undefined) {
      return []
    }

    const item = catalog.find((candidate) => candidate.id === itemId)

    if (item === undefined || item.slot !== slot) {
      return []
    }

    return [{ slot, itemId, assetRef: item.assetRef, z: index + 1 }]
  })
}

/**
 * Whether this item's threshold has been reached.
 *
 * An unrecognised requirement type resolves to locked. Failing closed keeps
 * corrupt saved data from handing out items.
 */
export function isUnlocked(item: CosmeticItem, progress: UnlockProgress): boolean {
  const { type, value } = item.unlockRequirement

  switch (type) {
    case 'level':
      return progress.level >= value
    case 'xp':
      return progress.totalXp >= value
    case 'streak':
      return progress.longestStreak >= value
    default:
      return false
  }
}

/** Every catalog id the given progress has earned, in catalog order. */
export function computeUnlockedIds(
  catalog: readonly CosmeticItem[],
  progress: UnlockProgress,
): string[] {
  return catalog.filter((item) => isUnlocked(item, progress)).map((item) => item.id)
}
