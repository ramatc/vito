import type { ComponentType } from 'react'
import {
  Apple,
  Bike,
  BookOpen,
  Brain,
  Coffee,
  Droplet,
  Dumbbell,
  Footprints,
  Heart,
  Leaf,
  Moon,
  Music,
  PenLine,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react'
import type { TranslationKey } from '../../i18n/keys'

/**
 * The icon registry.
 *
 * `Habit.icon` persists the `name` key, never a component or an import path —
 * so swapping the icon library later is a change to this one file, and a saved
 * habit whose icon disappears falls back instead of crashing the list.
 *
 * `labelKey` rather than `label`, following `navItems.ts`: the label is only
 * ever an accessible name, and this registry has no business knowing which
 * language is on screen. The form resolves the key on the way into `IconPicker`,
 * whose ring may not read the locale at all.
 */

export interface HabitIconOption {
  name: string
  labelKey: TranslationKey
  Icon: ComponentType<{ className?: string }>
}

export const HABIT_ICONS: readonly HabitIconOption[] = [
  { name: 'sparkles', labelKey: 'habits.icon.sparkles', Icon: Sparkles },
  { name: 'droplet', labelKey: 'habits.icon.droplet', Icon: Droplet },
  { name: 'apple', labelKey: 'habits.icon.apple', Icon: Apple },
  { name: 'coffee', labelKey: 'habits.icon.coffee', Icon: Coffee },
  { name: 'dumbbell', labelKey: 'habits.icon.dumbbell', Icon: Dumbbell },
  { name: 'footprints', labelKey: 'habits.icon.footprints', Icon: Footprints },
  { name: 'bike', labelKey: 'habits.icon.bike', Icon: Bike },
  { name: 'book-open', labelKey: 'habits.icon.bookOpen', Icon: BookOpen },
  { name: 'pen-line', labelKey: 'habits.icon.penLine', Icon: PenLine },
  { name: 'brain', labelKey: 'habits.icon.brain', Icon: Brain },
  { name: 'music', labelKey: 'habits.icon.music', Icon: Music },
  { name: 'leaf', labelKey: 'habits.icon.leaf', Icon: Leaf },
  { name: 'heart', labelKey: 'habits.icon.heart', Icon: Heart },
  { name: 'moon', labelKey: 'habits.icon.moon', Icon: Moon },
  { name: 'sun', labelKey: 'habits.icon.sun', Icon: Sun },
  { name: 'target', labelKey: 'habits.icon.target', Icon: Target },
]

export const DEFAULT_HABIT_ICON = 'sparkles'

const FALLBACK_ICON: ComponentType<{ className?: string }> = Sparkles

/** Never throws: an unknown key renders the default rather than a blank row. */
export function resolveHabitIcon(name: string): ComponentType<{ className?: string }> {
  return HABIT_ICONS.find((option) => option.name === name)?.Icon ?? FALLBACK_ICON
}
