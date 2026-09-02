import type { Locale } from '../types/models'

/**
 * The bucket -> BCP 47 map, and the only place a region code appears.
 *
 * `Locale` names a language bucket so the dictionary lookup stays simple, but
 * `Intl` and `<html lang>` both want a real tag. Splitting the two means a
 * future `en-GB` is a new bucket plus one entry here, not a rename of every key
 * in the dictionary.
 */
export const INTL_LOCALE_TAG: Record<Locale, string> = {
  en: 'en-US',
  es: 'es',
}

/**
 * The gate between an untrusted value and the dictionary.
 *
 * Written as an explicit comparison rather than a lookup in `INTL_LOCALE_TAG`,
 * because `key in record` also answers `true` for inherited properties like
 * `constructor` — a narrowing guard that can be fooled by a plain string is
 * worse than no guard at all.
 */
export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'es'
}
