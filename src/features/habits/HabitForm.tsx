import type { FormEvent } from 'react'
import { useId, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { IconPicker } from '../../components/ui/IconPicker'
import { XP_BY_DIFFICULTY } from '../../domain/habit/xpReward'
import { useTranslate } from '../../hooks/useTranslate'
import type { TranslationKey } from '../../i18n/keys'
import { usePreferencesStore } from '../../stores/preferencesStore'
import type { Difficulty, Frequency, Habit, Weekday } from '../../types/models'
import { cn } from '../../utils/cn'
import { DEFAULT_CATEGORY_KEY, SUGGESTED_CATEGORY_KEYS } from './categories'
import { buildFrequency, weekdayOptions } from './frequency'
import { DEFAULT_HABIT_ICON, HABIT_ICONS } from './habitIcons'

/**
 * Create/edit a habit.
 *
 * Presentational: it produces a valid draft and hands it up. It never writes to
 * a store, which is what lets the same form serve creation and editing.
 */

export interface HabitDraftValues {
  name: string
  icon: string
  category: string
  frequency: Frequency
  difficulty: Difficulty
}

export interface HabitFormProps {
  /** Present when editing; absent when creating. */
  habit?: Habit
  onSubmit(values: HabitDraftValues): void
  onCancel(): void
  submitLabel?: string
}

const DIFFICULTY_ORDER: readonly Difficulty[] = ['easy', 'normal', 'hard']

const DIFFICULTY_LABEL_KEYS: Record<Difficulty, TranslationKey> = {
  easy: 'habits.difficulty.easy',
  normal: 'habits.difficulty.normal',
  hard: 'habits.difficulty.hard',
}

export function HabitForm({ habit, onSubmit, onCancel, submitLabel }: HabitFormProps) {
  const t = useTranslate()
  const locale = usePreferencesStore((state) => state.preferences.locale)

  const nameId = useId()
  const categoryId = useId()
  const categoryListId = useId()
  const weekdayErrorId = useId()

  const [name, setName] = useState(habit?.name ?? '')
  const [icon, setIcon] = useState(habit?.icon ?? DEFAULT_HABIT_ICON)
  // Seeded once, from the language the form opened in. `category` is free-form
  // user data from the moment it is on screen, so a later language switch must
  // not silently rewrite what the user is about to save.
  const [category, setCategory] = useState(
    () => habit?.category ?? t(DEFAULT_CATEGORY_KEY),
  )
  const [difficulty, setDifficulty] = useState<Difficulty>(habit?.difficulty ?? 'normal')
  const [frequencyType, setFrequencyType] = useState<Frequency['type']>(
    habit?.frequency.type ?? 'daily',
  )
  const [days, setDays] = useState<Weekday[]>(
    habit?.frequency.type === 'weekdays' ? [...habit.frequency.days] : [],
  )
  const [showErrors, setShowErrors] = useState(false)

  const trimmedName = name.trim()
  const missingName = trimmedName === ''
  // A weekday habit with no day selected would never be due. The type system
  // already forbids it (`Frequency.days` is a non-empty tuple); this is the same
  // rule expressed where the user can see it.
  const missingDays = frequencyType === 'weekdays' && days.length === 0
  const canSubmit = !missingName && !missingDays

  // `Intl` builds these, so they change with the locale and nothing else.
  const weekdays = useMemo(() => weekdayOptions(locale), [locale])

  const toggleDay = (day: Weekday) => {
    setDays((current) =>
      current.includes(day)
        ? current.filter((selected) => selected !== day)
        : [...current, day],
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const frequency = buildFrequency(frequencyType, days)

    // `buildFrequency` returns null for exactly the state the button is disabled
    // for. Checked anyway: a disabled button is a hint, not an invariant — the
    // form can still be submitted with Enter in some browsers.
    if (missingName || frequency === null) {
      setShowErrors(true)

      return
    }

    onSubmit({
      name: trimmedName,
      icon,
      category: category.trim(),
      frequency,
      difficulty,
    })
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor={nameId}
          className="text-sm font-medium text-slate-700 dark:text-primary"
        >
          {t('habits.form.name')}
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
          placeholder={t('habits.form.namePlaceholder')}
          autoComplete="off"
          className="min-h-11 rounded-xl px-3 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-surface-raised dark:text-primary dark:ring-slate-700 dark:focus:ring-brand"
        />
        {showErrors && missingName && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {t('habits.form.nameError')}
          </p>
        )}
      </div>

      {/*
        The registry holds keys, not words, so the labels are resolved here on
        the way into a ring that may not read the locale itself.
      */}
      <IconPicker
        options={HABIT_ICONS.map((option) => ({ ...option, label: t(option.labelKey) }))}
        value={icon}
        onChange={setIcon}
        label={t('habits.form.icon')}
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor={categoryId}
          className="text-sm font-medium text-slate-700 dark:text-primary"
        >
          {t('habits.form.category')}
        </label>
        <input
          id={categoryId}
          list={categoryListId}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
          }}
          placeholder={t(DEFAULT_CATEGORY_KEY)}
          autoComplete="off"
          className="min-h-11 rounded-xl px-3 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-surface-raised dark:text-primary dark:ring-slate-700 dark:focus:ring-brand"
        />
        <datalist id={categoryListId}>
          {SUGGESTED_CATEGORY_KEYS.map((key) => (
            <option key={key} value={t(key)} />
          ))}
        </datalist>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-primary">
          {t('habits.form.repeats')}
        </legend>
        <div className="flex gap-2">
          <Button
            variant={frequencyType === 'daily' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
            aria-pressed={frequencyType === 'daily'}
            onClick={() => {
              setFrequencyType('daily')
            }}
          >
            {t('habits.frequency.daily')}
          </Button>
          <Button
            variant={frequencyType === 'weekdays' ? 'primary' : 'secondary'}
            size="sm"
            fullWidth
            aria-pressed={frequencyType === 'weekdays'}
            onClick={() => {
              setFrequencyType('weekdays')
            }}
          >
            {t('habits.frequency.weekdays')}
          </Button>
        </div>

        {frequencyType === 'weekdays' && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-1.5">
              {weekdays.map((option) => {
                const selected = days.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    aria-label={option.label}
                    aria-describedby={missingDays ? weekdayErrorId : undefined}
                    onClick={() => {
                      toggleDay(option.value)
                    }}
                    className={cn(
                      'size-11 flex-1 rounded-xl text-sm font-medium ring-1 transition-colors',
                      selected
                        ? 'bg-emerald-600 text-white ring-emerald-600 dark:bg-brand dark:text-surface dark:ring-brand'
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-surface-raised dark:text-muted dark:ring-slate-700 dark:hover:bg-slate-700',
                    )}
                  >
                    {option.short}
                  </button>
                )
              })}
            </div>
            {missingDays && (
              <p id={weekdayErrorId} className="text-xs text-slate-500 dark:text-muted">
                {t('habits.form.daysError')}
              </p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-primary">
          {t('habits.form.difficulty')}
        </legend>
        <div className="flex gap-2">
          {DIFFICULTY_ORDER.map((option) => {
            const selected = difficulty === option
            const label = t(DIFFICULTY_LABEL_KEYS[option])
            // XP derived from the single source of truth rather than inlined:
            // XP_BY_DIFFICULTY's own comment says no call site may hardcode
            // these numbers.
            const xp = t('common.xp', { count: XP_BY_DIFFICULTY[option] })

            return (
              <Button
                key={option}
                variant={selected ? 'primary' : 'secondary'}
                size="sm"
                fullWidth
                aria-pressed={selected}
                // Spelled out, because the label and the XP hint are adjacent
                // elements with no whitespace between them: the computed name
                // would otherwise be announced as "Hard30 XP".
                aria-label={`${label}, ${xp}`}
                onClick={() => {
                  setDifficulty(option)
                }}
              >
                {label}
                <span
                  className={cn(
                    'text-[11px]',
                    // The selected hint rides on the filled button, which
                    // inverts in the dark theme — so its XP tint has to invert
                    // with it rather than stay a pale emerald on light mint.
                    selected
                      ? 'text-emerald-50 dark:text-surface/75'
                      : 'text-slate-500 dark:text-muted',
                  )}
                >
                  {xp}
                </span>
              </Button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel ??
            t(habit === undefined ? 'habits.form.create' : 'habits.form.save')}
        </Button>
      </div>
    </form>
  )
}
