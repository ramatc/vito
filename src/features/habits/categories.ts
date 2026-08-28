/**
 * Category is a free-form user label (see `types/models.ts`), so this list is a
 * set of suggestions offered by the form, never a closed set the app enforces.
 * Adding one here changes a datalist, not a schema.
 */
export const SUGGESTED_CATEGORIES: readonly string[] = [
  'Health',
  'Movement',
  'Mind',
  'Learning',
  'Home',
  'Work',
  'Connection',
]

export const DEFAULT_CATEGORY = 'Health'
