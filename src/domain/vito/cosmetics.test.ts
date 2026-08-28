import { describe, expect, it } from 'vitest'
import type { CosmeticItem, EquippedItems } from '../../types/models'
import { COSMETIC_CATALOG } from './cosmeticCatalog'
import {
  SLOT_RENDER_ORDER,
  computeUnlockedIds,
  isUnlocked,
  resolveLayers,
} from './cosmetics'

const HAT: CosmeticItem = {
  id: 'hat-sprout',
  name: 'Sprout Cap',
  slot: 'hat',
  rarity: 'common',
  unlockRequirement: { type: 'level', value: 4 },
  assetRef: 'hat-sprout',
}

const BACKPACK: CosmeticItem = {
  id: 'backpack-explorer',
  name: "Explorer's Pack",
  slot: 'backpack',
  rarity: 'rare',
  unlockRequirement: { type: 'streak', value: 7 },
  assetRef: 'backpack-explorer',
}

const AURA: CosmeticItem = {
  id: 'aura-glow',
  name: 'Warm Glow',
  slot: 'aura',
  rarity: 'legendary',
  unlockRequirement: { type: 'xp', value: 2000 },
  assetRef: 'aura-glow',
}

const CATALOG = [HAT, BACKPACK, AURA]

const NOVICE = { level: 1, totalXp: 0, longestStreak: 0 }
const VETERAN = { level: 20, totalXp: 5000, longestStreak: 30 }

describe('SLOT_RENDER_ORDER', () => {
  it('paints back to front: aura, then backpack, then hat', () => {
    expect(SLOT_RENDER_ORDER).toEqual(['aura', 'backpack', 'hat'])
  })
})

describe('resolveLayers', () => {
  it('returns nothing when no slot is filled', () => {
    // Empty because the slot map is empty, not because the catalog is — the
    // cases below feed the same catalog and produce layers.
    expect(resolveLayers({}, CATALOG)).toEqual([])
  })

  it('resolves a single equipped item into a layer carrying its asset key', () => {
    expect(resolveLayers({ hat: 'hat-sprout' }, CATALOG)).toEqual([
      { slot: 'hat', itemId: 'hat-sprout', assetRef: 'hat-sprout', z: 3 },
    ])
  })

  it('orders layers back to front regardless of slot-map key order', () => {
    const equipped: EquippedItems = {
      hat: 'hat-sprout',
      aura: 'aura-glow',
      backpack: 'backpack-explorer',
    }

    expect(resolveLayers(equipped, CATALOG).map((layer) => layer.slot)).toEqual([
      'aura',
      'backpack',
      'hat',
    ])
  })

  it('gives every layer a z above the base sprite, increasing front to back', () => {
    const layers = resolveLayers(
      { hat: 'hat-sprout', aura: 'aura-glow', backpack: 'backpack-explorer' },
      CATALOG,
    )

    expect(layers.map((layer) => layer.z)).toEqual([1, 2, 3])
  })

  it('keeps a slot z stable when the slots behind it are empty', () => {
    // The hat must not slide down to z 1 just because the aura is off; the base
    // sprite owns z 0 and each slot owns a fixed depth.
    expect(resolveLayers({ hat: 'hat-sprout' }, CATALOG)[0].z).toBe(3)
  })

  it('skips an equipped id that is not in the catalog instead of crashing', () => {
    expect(resolveLayers({ hat: 'hat-deleted', aura: 'aura-glow' }, CATALOG)).toEqual([
      { slot: 'aura', itemId: 'aura-glow', assetRef: 'aura-glow', z: 1 },
    ])
  })

  it('skips an item saved into the wrong slot', () => {
    expect(resolveLayers({ hat: 'aura-glow' }, CATALOG)).toEqual([])
  })

  it('resolves against the real shipped catalog', () => {
    const layers = resolveLayers({ backpack: 'backpack-explorer' }, COSMETIC_CATALOG)

    expect(layers).toHaveLength(1)
    expect(layers[0].assetRef).toBe('backpack-explorer')
  })
})

describe('isUnlocked', () => {
  it('unlocks a level requirement at and above the threshold', () => {
    expect(isUnlocked(HAT, { ...NOVICE, level: 3 })).toBe(false)
    expect(isUnlocked(HAT, { ...NOVICE, level: 4 })).toBe(true)
    expect(isUnlocked(HAT, { ...NOVICE, level: 5 })).toBe(true)
  })

  it('unlocks an xp requirement at and above the threshold', () => {
    expect(isUnlocked(AURA, { ...NOVICE, totalXp: 1999 })).toBe(false)
    expect(isUnlocked(AURA, { ...NOVICE, totalXp: 2000 })).toBe(true)
  })

  it('unlocks a streak requirement against the longest streak, not the current one', () => {
    expect(isUnlocked(BACKPACK, { ...NOVICE, longestStreak: 6 })).toBe(false)
    expect(isUnlocked(BACKPACK, { ...NOVICE, longestStreak: 7 })).toBe(true)
  })

  it('reads only the requirement it names, ignoring the other two progress values', () => {
    // A level-gated item stays locked no matter how much XP or streak exists.
    expect(isUnlocked(HAT, { level: 1, totalXp: 999_999, longestStreak: 999 })).toBe(
      false,
    )
  })

  it('rejects an unrecognised requirement type rather than unlocking by accident', () => {
    const corrupt = {
      ...HAT,
      unlockRequirement: { type: 'vibes', value: 0 },
    } as unknown as CosmeticItem

    expect(isUnlocked(corrupt, VETERAN)).toBe(false)
  })

  describe('rarity has no effect on unlock logic', () => {
    it('unlocks a legendary item whose requirement is met', () => {
      expect(isUnlocked(AURA, VETERAN)).toBe(true)
    })

    it('leaves a common item locked when its requirement is not met', () => {
      expect(isUnlocked(HAT, NOVICE)).toBe(false)
    })

    it('gives the same answer for two items differing only in rarity', () => {
      const common: CosmeticItem = { ...AURA, id: 'aura-common', rarity: 'common' }
      const legendary: CosmeticItem = {
        ...AURA,
        id: 'aura-legendary',
        rarity: 'legendary',
      }
      const halfway = { ...NOVICE, totalXp: 2000 }

      expect(isUnlocked(common, halfway)).toBe(isUnlocked(legendary, halfway))
      expect(isUnlocked(common, NOVICE)).toBe(isUnlocked(legendary, NOVICE))
    })
  })
})

describe('computeUnlockedIds', () => {
  it('returns nothing for a brand new profile that has met no requirement', () => {
    expect(computeUnlockedIds(CATALOG, NOVICE)).toEqual([])
  })

  it('returns only the items whose thresholds are met', () => {
    expect(
      computeUnlockedIds(CATALOG, { level: 4, totalXp: 520, longestStreak: 0 }),
    ).toEqual(['hat-sprout'])
  })

  it('returns every item once all thresholds are met', () => {
    expect(computeUnlockedIds(CATALOG, VETERAN)).toEqual([
      'hat-sprout',
      'backpack-explorer',
      'aura-glow',
    ])
  })

  it('works against the real shipped catalog', () => {
    expect(computeUnlockedIds(COSMETIC_CATALOG, VETERAN)).toEqual(
      COSMETIC_CATALOG.map((item) => item.id),
    )
  })
})
