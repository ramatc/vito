import { EN } from './en'

/**
 * Every key the app may ask for. Derived from the English dictionary rather than
 * hand-maintained, so a key can never exist in the union without existing in at
 * least one dictionary.
 */
export type TranslationKey = keyof typeof EN

/**
 * What a non-source dictionary must be. `Record` over the full union rather than
 * `Partial`, which is the whole parity mechanism: a key added to `en.ts` and
 * forgotten in `es.ts` fails `tsc -b` at the missing property, so there is no
 * runtime parity test to write and none to forget to run.
 */
export type Dictionary = Record<TranslationKey, string>
