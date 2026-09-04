import type { TranslationKey } from '../../i18n/keys'
import { tDynamic } from '../../i18n/translate'
import type { Locale } from '../../types/models'

/**
 * Where a cosmetic's display name lives now that `domain/` holds only ids.
 *
 * This is the same split `cosmeticAssets.ts` already makes for artwork: the
 * catalog names a stable id, and each rendering concern keeps its own
 * id-keyed table beside the ring that needs it. A name in the catalog would
 * be a string the domain cannot translate and the UI cannot override — and it
 * would put English inside the one ring that is import-pure by contract.
 *
 * Keys are camel-cased (`cosmetic.hatSprout.name`) while ids stay hyphenated.
 * The id is a persisted value in every saved `EquippedItems`; the key is only
 * ever read here, so it is free to follow the dictionary's own conventions.
 */
export const COSMETIC_NAME_KEYS: Record<string, TranslationKey> = {
  'hat-sprout': 'cosmetic.hatSprout.name',
  'backpack-explorer': 'cosmetic.backpackExplorer.name',
  'aura-glow': 'cosmetic.auraGlow.name',
}

/**
 * The id -> name lookup, tolerant of an id it has never heard of.
 *
 * An `EquippedItems` saved by an older build can still name an item this
 * release dropped. `tDynamic` already resolves an unknown key to the key
 * itself, so an unknown id surfaces as the id: visible, diagnosable, and not
 * a blank label or a thrown error taking the closet down over a hat.
 */
export function cosmeticName(locale: Locale, id: string): string {
  const key: TranslationKey | undefined = COSMETIC_NAME_KEYS[id]

  return tDynamic(locale, key ?? id)
}
