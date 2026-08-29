import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeRepositories } from '../test/fakeRepositories'
import { setRepositories } from './repositories'
import { useVitoStore } from './vitoStore'

/**
 * `equip` and `unequip` had no caller until the closet landed, and three of
 * `equip`'s four branches are unreachable from the UI by construction — the
 * closet only ever offers items that exist, sit in the open slot, and have been
 * earned. Saved data outlives catalog edits, though, so those branches are
 * exactly the ones worth pinning here rather than through a screen.
 *
 * `unlockedItemIds` is seeded directly instead of being earned through
 * `syncUnlocks`, which is already covered end to end in `completeHabit.test.ts`.
 */

const EARNED = ['hat-sprout', 'backpack-explorer', 'aura-glow']

async function load(vito: { equippedItems?: Record<string, string> } = {}) {
  const fake = createFakeRepositories({
    vito: { unlockedItemIds: EARNED, ...vito },
  })
  setRepositories(fake.repos)
  await useVitoStore.getState().load()

  return fake
}

const wearing = () => useVitoStore.getState().vito.equippedItems

beforeEach(() => {
  setRepositories(createFakeRepositories().repos)
})

describe('vitoStore.equip', () => {
  it('leaves every other slot exactly as it was', async () => {
    await load({
      equippedItems: { backpack: 'backpack-explorer', aura: 'aura-glow' },
    })

    await useVitoStore.getState().equip('hat', 'hat-sprout')

    expect(wearing()).toEqual({
      hat: 'hat-sprout',
      backpack: 'backpack-explorer',
      aura: 'aura-glow',
    })
  })

  it('replaces only the item in the slot being filled', async () => {
    await load({ equippedItems: { hat: 'hat-sprout', aura: 'aura-glow' } })

    await useVitoStore.getState().equip('aura', 'aura-glow')

    expect(wearing()).toEqual({ hat: 'hat-sprout', aura: 'aura-glow' })
  })

  it('persists the change, not just the in-memory copy', async () => {
    const fake = await load()

    await useVitoStore.getState().equip('hat', 'hat-sprout')

    expect(fake.data.vito.equippedItems).toEqual({ hat: 'hat-sprout' })
  })

  it('ignores an item that has not been earned', async () => {
    const fake = createFakeRepositories({ vito: { unlockedItemIds: [] } })
    setRepositories(fake.repos)
    await useVitoStore.getState().load()

    await useVitoStore.getState().equip('hat', 'hat-sprout')

    expect(wearing()).toEqual({})
    expect(fake.data.vito.equippedItems).toEqual({})
  })

  it('ignores an item that belongs to a different slot', async () => {
    await load()

    await useVitoStore.getState().equip('hat', 'aura-glow')

    expect(wearing()).toEqual({})
  })

  it('ignores an id that is not in the catalog at all', async () => {
    await load()

    await useVitoStore.getState().equip('hat', 'hat-from-an-older-save')

    expect(wearing()).toEqual({})
  })
})

describe('vitoStore.unequip', () => {
  it('removes the slot and nothing else', async () => {
    await load({ equippedItems: { hat: 'hat-sprout', aura: 'aura-glow' } })

    await useVitoStore.getState().unequip('hat')

    expect(wearing()).toEqual({ aura: 'aura-glow' })
  })

  it('is a quiet no-op on an empty slot', async () => {
    await load({ equippedItems: { aura: 'aura-glow' } })

    await useVitoStore.getState().unequip('hat')

    expect(wearing()).toEqual({ aura: 'aura-glow' })
  })

  it('keeps the item earned — taking something off never spends it', async () => {
    await load({ equippedItems: { hat: 'hat-sprout' } })

    await useVitoStore.getState().unequip('hat')

    expect(useVitoStore.getState().vito.unlockedItemIds).toEqual(EARNED)
  })
})
