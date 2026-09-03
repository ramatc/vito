import type { TranslationKey } from '../../i18n/keys'

/**
 * Category is a free-form user label (see `types/models.ts`), so this list is a
 * set of suggestions offered by the form, never a closed set the app enforces.
 * Adding one here changes a datalist, not a schema.
 *
 * Keys rather than words, for the same reason `navItems.ts` holds `labelKey`:
 * the suggestion a Spanish reader picks has to arrive in Spanish, and the value
 * that lands in `Habit.category` is then whatever they saw. What is persisted
 * stays a plain string — translating a suggestion does not make the field an
 * enum, and a habit created in one language keeps the word it was created with.
 */
export const SUGGESTED_CATEGORY_KEYS: readonly TranslationKey[] = [
  'habits.category.health',
  'habits.category.movement',
  'habits.category.mind',
  'habits.category.learning',
  'habits.category.home',
  'habits.category.work',
  'habits.category.connection',
]

export const DEFAULT_CATEGORY_KEY: TranslationKey = 'habits.category.health'
