import type { CosmeticItem } from '../../types/models'

/**
 * The MVP cosmetic catalog.
 *
 * This is DATA, not a limit. The equip and render logic reads the catalog and
 * the slot map, so adding an item — or a whole new slot — never touches
 * `VitoState`, the repositories, or any previously saved value.
 *
 * Vito's base look is deliberately absent: it is the evolution-stage sprite
 * from `evolution.ts`, always present and never equippable, so it is not a
 * `CosmeticSlot` item. Making it one would imply it could be unequipped.
 *
 * `assetRef` is a key the UI layer resolves to a component. The domain ring
 * never imports a bundler asset.
 *
 * Every `unlockRequirement` is a deterministic threshold. `rarity` is a display
 * tier for the closet UI and is never read by the unlock logic — there is no
 * randomness anywhere in this system.
 */
export const COSMETIC_CATALOG: readonly CosmeticItem[] = [
  {
    id: 'hat-sprout',
    name: 'Sprout Cap',
    slot: 'hat',
    rarity: 'common',
    // Lines up with the first evolution bracket, so growing up and getting a
    // hat happen on the same level.
    unlockRequirement: { type: 'level', value: 4 },
    assetRef: 'hat-sprout',
  },
  {
    id: 'backpack-explorer',
    name: "Explorer's Pack",
    slot: 'backpack',
    rarity: 'rare',
    unlockRequirement: { type: 'streak', value: 7 },
    assetRef: 'backpack-explorer',
  },
  {
    id: 'aura-glow',
    name: 'Warm Glow',
    slot: 'aura',
    rarity: 'legendary',
    unlockRequirement: { type: 'xp', value: 2000 },
    assetRef: 'aura-glow',
  },
]
