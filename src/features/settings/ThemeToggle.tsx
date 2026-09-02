import { useId } from 'react'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { Theme } from '../../types/models'
import { cn } from '../../utils/cn'

/**
 * The manual theme override.
 *
 * Unlike the language names, these two ARE translated: "Light" and "Dark"
 * describe the app, not a language, and a Spanish reader has no reason to meet
 * an English word here.
 *
 * The keys live in a `Record<Theme, …>` rather than in two hardcoded branches,
 * so the day a third theme is added the compiler asks for its word instead of
 * letting the control render one option short. Nothing here touches `<html>` —
 * the store is the only thing it writes to, and `App` dresses the document from
 * the resulting state.
 */

const THEME_ORDER: readonly Theme[] = ['light', 'dark']

const THEME_LABEL_KEYS: Record<Theme, TranslationKey> = {
  light: 'settings.theme.light',
  dark: 'settings.theme.dark',
}

export interface ThemeToggleProps {
  label: string
}

export function ThemeToggle({ label }: ThemeToggleProps) {
  const t = useTranslate()
  const theme = usePreferencesStore((state) => state.preferences.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2">
      <h2 id={labelId} className="text-sm font-medium text-slate-900">
        {label}
      </h2>
      <div role="group" aria-labelledby={labelId} className="flex gap-2">
        {THEME_ORDER.map((option) => {
          const selected = option === theme

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                void setTheme(option)
              }}
              className={cn(
                'min-h-11 shrink-0 rounded-xl px-4 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2',
                selected
                  ? 'bg-emerald-600 text-white focus-visible:outline-emerald-600'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400',
              )}
            >
              {t(THEME_LABEL_KEYS[option])}
            </button>
          )
        })}
      </div>
    </div>
  )
}
