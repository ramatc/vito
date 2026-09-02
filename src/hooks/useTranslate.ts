import { useCallback } from 'react'
import type { TranslationKey } from '../i18n/keys'
import type { TranslationParams } from '../i18n/translate'
import { t } from '../i18n/translate'
import { usePreferencesStore } from '../stores/preferencesStore'

/**
 * The bridge between the pure dictionary and the rendering rings.
 *
 * Subscribing to the locale rather than reading it once is the entire point:
 * `setLocale` writes to the store, every subscriber re-renders, and the app
 * repaints in the new language without a reload. A version that resolved the
 * locale at mount would look identical in every test but that one.
 *
 * `useCallback` keyed on the locale keeps the returned function stable between
 * renders, so a consumer can list it in a `useMemo` dependency array without
 * recomputing on every parent render.
 *
 * Note there is no `tDynamic` or `tCount` equivalent here. Those take a key
 * that is not compile-checked or a pair of forms, and both have exactly one
 * caller apiece — they read the locale from the store themselves rather than
 * widening this surface for everyone.
 */
export function useTranslate(): (
  key: TranslationKey,
  params?: TranslationParams,
) => string {
  const locale = usePreferencesStore((state) => state.preferences.locale)

  return useCallback(
    (key: TranslationKey, params?: TranslationParams) => t(locale, key, params),
    [locale],
  )
}
