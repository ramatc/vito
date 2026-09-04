import { describe, expect, it } from 'vitest'
import { COSMETIC_CATALOG } from '../../../domain/vito/cosmeticCatalog'
import { COSMETIC_NAME_KEYS, cosmeticName } from '../cosmeticCopy'

/**
 * The lookup that replaces `CosmeticItem.name`.
 *
 * Names are asserted as literals rather than read back out of the dictionary:
 * a test that resolves its expectation through the same table as the code
 * would pass just as happily with the wrong Spanish in it.
 */

describe('cosmeticName', () => {
  it('resolves a catalog id to its English display name', () => {
    expect(cosmeticName('en', 'hat-sprout')).toBe('Sprout Cap')
  })

  it('resolves the same id to the Spanish name when the locale changes', () => {
    expect(cosmeticName('es', 'hat-sprout')).toBe('Gorra Brote')
  })

  it('resolves every other catalog id too, in both locales', () => {
    expect(cosmeticName('en', 'backpack-explorer')).toBe("Explorer's Pack")
    expect(cosmeticName('es', 'backpack-explorer')).toBe('Mochila de Explorador')
    expect(cosmeticName('en', 'aura-glow')).toBe('Warm Glow')
    expect(cosmeticName('es', 'aura-glow')).toBe('Brillo Cálido')
  })

  it('falls back to the raw id for an id no dictionary knows', () => {
    // An `EquippedItems` written by an older build can name an item this
    // release no longer ships. Showing the id is ugly and honest; throwing
    // would take the closet down over a cosmetic.
    expect(cosmeticName('es', 'hat-from-an-older-save')).toBe('hat-from-an-older-save')
    expect(cosmeticName('en', 'hat-from-an-older-save')).toBe('hat-from-an-older-save')
  })
})

describe('COSMETIC_NAME_KEYS', () => {
  it('covers every id the catalog ships, so nothing renders as an id', () => {
    expect(COSMETIC_CATALOG).toHaveLength(3)

    for (const item of COSMETIC_CATALOG) {
      expect(COSMETIC_NAME_KEYS[item.id]).toBeTypeOf('string')
      expect(cosmeticName('es', item.id)).not.toBe(item.id)
    }
  })
})
