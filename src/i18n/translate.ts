import type { Locale } from '../types/models'
import { EN } from './en'
import { ES } from './es'
import type { TranslationKey } from './keys'

/**
 * The lookup itself: pure, synchronous, and free of React.
 *
 * That purity is the reason the dictionary is hand-rolled rather than pulled
 * from a library. `components/` is a props-only ring by contract, so the one
 * thing a provider-based library would buy — implicit access from anywhere —
 * is exactly what this codebase does not want. What is left is a `Record`
 * lookup and a string replace.
 */

export type TranslationParams = Record<string, string | number>

const DICTIONARIES: Record<Locale, Readonly<Record<string, string | undefined>>> = {
  en: EN,
  es: ES,
}

/** Named, never positional: a translator may reorder a sentence freely. */
const PLACEHOLDER = /\{(\w+)\}/g

/**
 * An unmatched placeholder is left in the output on purpose. A missing param is
 * a caller bug, and `{scheduled}` on screen names it; blanking it would produce
 * a sentence that reads as intentional and gets shipped.
 */
function interpolate(template: string, params: TranslationParams | undefined): string {
  if (params === undefined) {
    return template
  }

  return template.replace(PLACEHOLDER, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  )
}

/**
 * Active locale, then English, then the key.
 *
 * The English leg is unreachable while `Dictionary` keeps `es.ts` total over
 * `TranslationKey` — it is there so that the day a dictionary arrives at
 * runtime, or is relaxed to `Partial`, a gap degrades to English instead of
 * exposing a dotted key. The last leg is the reachable one: `tDynamic` is
 * handed ids, and an id from an older save has no entry anywhere.
 */
function resolve(locale: Locale, key: string): string {
  return DICTIONARIES[locale][key] ?? EN[key as TranslationKey] ?? key
}

/** The everyday call. `key` is compile-checked against the English dictionary. */
export function t(
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  return interpolate(resolve(locale, key), params)
}

/**
 * The escape hatch for a key assembled at runtime — today only the cosmetic
 * id -> name lookup. Same resolution as `t`; the difference is entirely in the
 * type, which is the point: everything that *can* be checked still is.
 */
export function tDynamic(
  locale: Locale,
  key: string,
  params?: TranslationParams,
): string {
  return interpolate(resolve(locale, key), params)
}

/**
 * Two forms, not `Intl.PluralRules`.
 *
 * English and Spanish cardinals both have exactly `one` and `other`, and both
 * put zero in `other`, so the rules engine would resolve to this same branch at
 * the cost of a heavier API and a locale-data dependency. A third locale with a
 * `few`/`many` category is the signal to swap this out — and it is a two-line
 * swap, because callers pass forms rather than counts-to-strings.
 */
export function tCount(
  locale: Locale,
  forms: { one: TranslationKey; other: TranslationKey },
  count: number,
  params?: TranslationParams,
): string {
  return t(locale, count === 1 ? forms.one : forms.other, { count, ...params })
}
