import { useId } from 'react'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { Locale } from '../../types/models'
import { cn } from '../../utils/cn'

/**
 * The manual language override.
 *
 * The option names are endonyms — each language written in itself — and are
 * deliberately NOT dictionary entries. Translating them is the one thing that
 * would strand the user this control exists for: someone who lands in a
 * language they cannot read has to be able to find their way back, and
 * "Spanish" written in Spanish is no help to them.
 *
 * Everything else here is a subscription. Clicking writes to the store, the
 * store persists and every subscriber repaints, so the app changes language
 * without a reload and remembers the choice on the next one.
 */

interface LocaleOption {
  locale: Locale
  /** The language's own name for itself. */
  label: string
}

const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { locale: 'en', label: 'English' },
  { locale: 'es', label: 'Español' },
]

export interface LanguageToggleProps {
  label: string
}

export function LanguageToggle({ label }: LanguageToggleProps) {
  const locale = usePreferencesStore((state) => state.preferences.locale)
  const setLocale = usePreferencesStore((state) => state.setLocale)
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2">
      <h2 id={labelId} className="text-sm font-medium text-slate-900 dark:text-primary">
        {label}
      </h2>
      <div role="group" aria-labelledby={labelId} className="flex gap-2">
        {LOCALE_OPTIONS.map((option) => {
          const selected = option.locale === locale

          return (
            <button
              key={option.locale}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                // Fire and forget: the store sets state before it awaits the
                // write, so the UI is already correct and a failed save is
                // reported through the storage error handler, not from here.
                void setLocale(option.locale)
              }}
              className={cn(
                'min-h-11 shrink-0 rounded-xl px-4 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2',
                // The same segmented button `SlotPicker` and `ThemeToggle` draw,
                // down to the byte — see `SlotPicker`'s note.
                selected
                  ? 'bg-emerald-600 text-white focus-visible:outline-emerald-600 dark:bg-brand dark:text-surface dark:focus-visible:outline-brand'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400 dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-500',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
