/**
 * Persisted entity shapes — the leaf ring of the architecture.
 *
 * Rule: if it is persisted, it lives here. If it is derived, it lives in `domain/`.
 * That is why `level`, `evolutionStage` and `mood` are absent: they are pure
 * functions of `totalXp` and are computed on read, never stored. Storing them
 * would create a second source of truth that silently drifts whenever the game
 * balance constants are retuned.
 *
 * This module must import nothing (enforced by `no-restricted-imports` in
 * `.oxlintrc.json`).
 */

/** Local-time calendar day, formatted `YYYY-MM-DD`. */
export type DateKey = string

export type Difficulty = 'easy' | 'normal' | 'hard'

export type CosmeticSlot = 'hat' | 'backpack' | 'aura'

/**
 * Slot -> `CosmeticItem` id. Partial by design: adding a new slot to
 * `CosmeticSlot` keeps every previously saved value valid, so no migration is
 * needed when the wardrobe grows.
 */
export type EquippedItems = Partial<Record<CosmeticSlot, string>>

/** JS weekday numbering: 0 = Sunday .. 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * `days` is a non-empty tuple on purpose. A `weekdays` habit with no day
 * selected is never due, which is not a state the product has — making it
 * unrepresentable turns a runtime validation into a compile error.
 */
export type Frequency =
  { type: 'daily' } | { type: 'weekdays'; days: [Weekday, ...Weekday[]] }

export interface Habit {
  id: string
  name: string
  /** Key into the icon map in the UI layer, not an icon-library import name. */
  icon: string
  /**
   * Free-form user-supplied label. Deliberately not an enum: the MVP lets users
   * invent their own groupings, and locking the set here would need a migration
   * for every new category.
   */
  category: string
  frequency: Frequency
  difficulty: Difficulty
  /** ISO timestamp. */
  createdAt: string
  /** ISO timestamp. Soft delete — the MVP never hard-deletes a habit. */
  archivedAt?: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  date: DateKey
  /**
   * Snapshot of the XP granted at completion time. History is immutable:
   * editing a habit's difficulty later never retro-adjusts past awards.
   */
  xpAwarded: number
  /** ISO timestamp. */
  completedAt: string
}

/**
 * Counter-boxed comeback bonus. It expires by being used up, not by wall-clock
 * time, which keeps it deterministic in tests and impossible to lose mid-session.
 */
export interface ComebackBoost {
  remainingCompletions: number
  multiplier: number
  triggeredOn: DateKey
}

export interface UserProgress {
  /** The only stored progression fact. Level is derived from it. */
  totalXp: number
  momentum: number
  /** Daily credit-cap tracker for momentum, reset per calendar day. */
  momentumCredit: { date: DateKey; amount: number }
  currentStreak: number
  longestStreak: number
  lastActivityDate: DateKey | null
  /** Last day the rollover job ran — makes day rollover idempotent. */
  lastRolloverDate: DateKey | null
  /** Cooldown anchor preventing comeback re-triggering. */
  lastComebackDate: DateKey | null
  activeBoost: ComebackBoost | null
}

/** Persisted cosmetics only. Mood and evolution stage are derived. */
export interface VitoState {
  equippedItems: EquippedItems
  unlockedItemIds: string[]
}

/**
 * The two language buckets the app ships. Deliberately a bucket and not a BCP 47
 * tag: this project's Spanish is Rioplatense, so `es-ES` would be actively
 * wrong, and regional precision is a *formatting* concern that belongs to
 * `Intl`, not to a dictionary lookup.
 */
export type Locale = 'en' | 'es'

export type Theme = 'light' | 'dark'

/**
 * Chrome-level choices, persisted apart from progress on purpose: resetting
 * progress puts Vito back at day one, it does not put the app back into a
 * language the user does not read.
 */
export interface AppPreferences {
  locale: Locale
  theme: Theme
}

export interface CosmeticItem {
  id: string
  slot: CosmeticSlot
  /** Display tier only — never used as a drop weight. Unlocks are deterministic. */
  rarity: 'common' | 'rare' | 'legendary'
  unlockRequirement: { type: 'level' | 'xp' | 'streak'; value: number }
  /** Key into the asset map in the UI layer, not an import path. */
  assetRef: string
}
