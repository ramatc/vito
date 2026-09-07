import type { CosmeticItem, CosmeticSlot, EquippedItems } from '../../types/models'

/**
 * Cosmetic layering and unlocking.
 *
 * Both are pure lookups over the catalog. There is no randomness in this
 * system: `rarity` is a display tier the closet UI reads, and nothing here ever
 * consults it.
 */

/** Back to front, among cosmetics. Whether a slot sits behind or in front of the body itself is `BEHIND_BODY_SLOT_COUNT`, below. */
export const SLOT_RENDER_ORDER: readonly CosmeticSlot[] = ['aura', 'backpack', 'hat']

/**
 * How many leading slots in `SLOT_RENDER_ORDER` render behind the body and
 * face rather than on top of them: an aura should surround Vito and a
 * backpack should tuck behind his back, but a hat sits on the head. Grow
 * this (and reorder `SLOT_RENDER_ORDER`) if a future slot also needs to sit
 * behind the body — nothing else about `resolveLayers` has to change.
 */
const BEHIND_BODY_SLOT_COUNT = 2

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
 * A negative `z` puts a slot behind the body and face sprites; a positive one
 * puts it in front. This works because `VitoAvatar` never gives body/face a
 * z-index of their own — CSS places that `z-index: auto` pair strictly
 * between any negative and any positive sibling by spec (CSS2.1 §E: negative
 * stack levels paint before the auto/positioned-at-0 group, positive ones
 * after), so the boundary is guaranteed without VitoAvatar having to know
 * which slots are which. `BEHIND_BODY_SLOT_COUNT` is the only thing that
 * decides which side of that line a slot falls on.
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

    const z =
      index < BEHIND_BODY_SLOT_COUNT
        ? index - BEHIND_BODY_SLOT_COUNT
        : index - BEHIND_BODY_SLOT_COUNT + 1

    return [{ slot, itemId, assetRef: item.assetRef, z }]
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
