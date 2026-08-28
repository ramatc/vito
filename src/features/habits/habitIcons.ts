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

/**
 * The icon registry.
 *
 * `Habit.icon` persists the `name` key, never a component or an import path —
 * so swapping the icon library later is a change to this one file, and a saved
 * habit whose icon disappears falls back instead of crashing the list.
 */

export interface HabitIconOption {
  name: string
  label: string
  Icon: ComponentType<{ className?: string }>
}

export const HABIT_ICONS: readonly HabitIconOption[] = [
  { name: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { name: 'droplet', label: 'Water', Icon: Droplet },
  { name: 'apple', label: 'Food', Icon: Apple },
  { name: 'coffee', label: 'Coffee', Icon: Coffee },
  { name: 'dumbbell', label: 'Strength', Icon: Dumbbell },
  { name: 'footprints', label: 'Walk', Icon: Footprints },
  { name: 'bike', label: 'Cycle', Icon: Bike },
  { name: 'book-open', label: 'Reading', Icon: BookOpen },
  { name: 'pen-line', label: 'Writing', Icon: PenLine },
  { name: 'brain', label: 'Focus', Icon: Brain },
  { name: 'music', label: 'Music', Icon: Music },
  { name: 'leaf', label: 'Nature', Icon: Leaf },
  { name: 'heart', label: 'Care', Icon: Heart },
  { name: 'moon', label: 'Sleep', Icon: Moon },
  { name: 'sun', label: 'Morning', Icon: Sun },
  { name: 'target', label: 'Goal', Icon: Target },
]

export const DEFAULT_HABIT_ICON = 'sparkles'

const FALLBACK_ICON: ComponentType<{ className?: string }> = Sparkles

/** Never throws: an unknown key renders the default rather than a blank row. */
export function resolveHabitIcon(name: string): ComponentType<{ className?: string }> {
  return HABIT_ICONS.find((option) => option.name === name)?.Icon ?? FALLBACK_ICON
}
