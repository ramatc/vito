import type { FormEvent } from 'react'
import { useId, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { IconPicker } from '../../components/ui/IconPicker'
import type { Difficulty, Frequency, Habit, Weekday } from '../../types/models'
import { cn } from '../../utils/cn'
import { DEFAULT_CATEGORY, SUGGESTED_CATEGORIES } from './categories'
import { WEEKDAY_OPTIONS, buildFrequency } from './frequency'
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

const DIFFICULTIES: readonly { value: Difficulty; label: string; xp: string }[] = [
  { value: 'easy', label: 'Easy', xp: '10 XP' },
  { value: 'normal', label: 'Normal', xp: '20 XP' },
  { value: 'hard', label: 'Hard', xp: '30 XP' },
]

export function HabitForm({ habit, onSubmit, onCancel, submitLabel }: HabitFormProps) {
  const nameId = useId()
  const categoryId = useId()
  const categoryListId = useId()
  const weekdayErrorId = useId()

  const [name, setName] = useState(habit?.name ?? '')
  const [icon, setIcon] = useState(habit?.icon ?? DEFAULT_HABIT_ICON)
  const [category, setCategory] = useState(habit?.category ?? DEFAULT_CATEGORY)
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
        <label htmlFor={nameId} className="text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
          placeholder="Drink water"
          autoComplete="off"
          className="min-h-11 rounded-xl px-3 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {showErrors && missingName && (
          <p className="text-xs text-rose-600">Give your habit a name to save it.</p>
        )}
      </div>

      <IconPicker options={HABIT_ICONS} value={icon} onChange={setIcon} label="Icon" />

      <div className="flex flex-col gap-2">
        <label htmlFor={categoryId} className="text-sm font-medium text-slate-700">
          Category
        </label>
        <input
          id={categoryId}
          list={categoryListId}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
          }}
          placeholder="Health"
          autoComplete="off"
          className="min-h-11 rounded-xl px-3 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <datalist id={categoryListId}>
          {SUGGESTED_CATEGORIES.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-slate-700">Repeats</legend>
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
            Every day
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
            Certain days
          </Button>
        </div>

        {frequencyType === 'weekdays' && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-1.5">
              {WEEKDAY_OPTIONS.map((option) => {
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
                        ? 'bg-emerald-600 text-white ring-emerald-600'
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    {option.short}
                  </button>
                )
              })}
            </div>
            {missingDays && (
              <p id={weekdayErrorId} className="text-xs text-slate-500">
                Pick at least one day — a habit with no days would never come up.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-slate-700">Difficulty</legend>
        <div className="flex gap-2">
          {DIFFICULTIES.map((option) => (
            <Button
              key={option.value}
              variant={difficulty === option.value ? 'primary' : 'secondary'}
              size="sm"
              fullWidth
              aria-pressed={difficulty === option.value}
              // Spelled out, because the label and the XP hint are adjacent
              // elements with no whitespace between them: the computed name
              // would otherwise be announced as "Hard30 XP".
              aria-label={`${option.label}, ${option.xp}`}
              onClick={() => {
                setDifficulty(option.value)
              }}
            >
              {option.label}
              <span
                className={cn(
                  'text-[11px]',
                  difficulty === option.value ? 'text-emerald-50' : 'text-slate-500',
                )}
              >
                {option.xp}
              </span>
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel ?? (habit === undefined ? 'Add habit' : 'Save changes')}
        </Button>
      </div>
    </form>
  )
}
