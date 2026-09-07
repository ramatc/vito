import { useCallback, useMemo, useRef, useState } from 'react'
import { habitsScheduledOn } from '../domain/habit/schedule'
import { todayKey } from '../domain/shared/date'
import type { CompletionOutcome } from '../stores/habitStore'
import { useHabitStore } from '../stores/habitStore'
import type { ReactionType } from '../stores/uiStore'
import { useUiStore } from '../stores/uiStore'
import type { DateKey } from '../types/models'
import { useTranslate } from './useTranslate'

/**
 * Turns a completion into what the user sees.
 *
 * `habitStore` returns a `CompletionOutcome` and nothing else — no copy, no
 * animation name. This hook is where that plain data becomes a reaction and a
 * message, which is what keeps the whole game engine testable without a UI.
 */

type Translate = ReturnType<typeof useTranslate>

/**
 * A mis-tap undo immediately followed by re-checking the same habit is one
 * user gesture, not two completions — the XP round trip is real (revoked,
 * then re-awarded), but celebrating it twice reads as a glitch. Past this
 * window, a recheck is a deliberate new completion and earns its toast.
 */
const RECENT_UNDO_WINDOW_MS = 4000

/**
 * Whether every habit scheduled for `today` now has a completion.
 *
 * Reads the store directly rather than through `useTodayHabits` — this file
 * only ever needs the single boolean right after a write lands, not a
 * subscription, and pulling in the hook would re-render `complete` on every
 * unrelated habit-store change.
 */
function isTodayFullyDone(today: DateKey): boolean {
  const { habits, completions } = useHabitStore.getState()
  const scheduled = habitsScheduledOn(habits, today)

  if (scheduled.length === 0) {
    return false
  }

  const completedIds = new Set(
    completions.filter((completion) => completion.date === today).map((c) => c.habitId),
  )

  return scheduled.every((habit) => completedIds.has(habit.id))
}

/** One reaction per completion, most significant event first. */
function reactionFor(outcome: CompletionOutcome, allDone: boolean): ReactionType {
  if (outcome.leveledUp) {
    return 'levelUp'
  }

  if (outcome.unlockedItemIds.length > 0) {
    return 'unlock'
  }

  // Reserved for the stronger moment: an ordinary completion stays `celebrate`,
  // finishing every scheduled habit for the day earns the bigger one.
  if (allDone) {
    return 'allDone'
  }

  return 'celebrate'
}

/**
 * Whether an outcome's only news is XP — no level, no unlock, no comeback
 * boost. That case gets its reward shown contextually, next to the habit that
 * earned it (`lastGain`), instead of as a global toast; the others keep the
 * toast because they are carrying a message the XP badge cannot.
 */
function isPlainCompletion(outcome: CompletionOutcome): boolean {
  return !outcome.leveledUp && outcome.unlockedItemIds.length === 0 && !outcome.boosted
}

/**
 * Still pure: the translator arrives as an argument rather than being reached
 * for, so which message an outcome earns stays a function of the outcome alone.
 */
function messageFor(t: Translate, outcome: CompletionOutcome): string {
  const xp = t('common.xpGain', { count: outcome.xpGained })

  if (outcome.leveledUp) {
    return t('habits.toast.levelUp', { xp, level: outcome.newLevel })
  }

  if (outcome.unlockedItemIds.length > 0) {
    return t('habits.toast.unlock', { xp })
  }

  if (outcome.boosted) {
    return t('habits.toast.comeback', { xp })
  }

  return xp
}

/**
 * The reward from the most recent completion, for whichever `HabitCard` earned
 * it to show contextually. `nonce` is what makes two same-XP completions in a
 * row distinct: without it, completing two easy habits back to back would emit
 * reference-equal-looking state and the second badge would never replay.
 */
export interface XpGainEvent {
  habitId: string
  xp: number
  nonce: number
}

export interface CompleteHabitActions {
  /**
   * Records today's completion. Resolves to `null` when the store no-ops —
   * the habit was already done today, or is not due today. Tapping twice is
   * something people do; it should be quiet, not an error. Also resolves to
   * `null` when the store action rejects for real; the rejection is caught
   * here and surfaced as a toast instead, so callers only ever see a promise
   * that resolves.
   */
  complete(habitId: string): Promise<CompletionOutcome | null>
  /** Un-checks today's completion, for a mis-tap. */
  undo(habitId: string): Promise<void>
  /** Completes or un-completes a habit, based on whether it is done today. */
  toggle(habitId: string, isCompletedToday: boolean): void
  /** Habit ids with a completion/undo round trip in flight right now. */
  pendingHabitIds: readonly string[]
  /**
   * The most recent plain-XP completion from this hook instance, or `null`
   * before one has happened. Absent for undo, for a quiet undo-recheck, and
   * for the level-up/unlock/comeback cases that already have a toast.
   */
  lastGain: XpGainEvent | null
}

export function useCompleteHabit(today: DateKey = todayKey()): CompleteHabitActions {
  const t = useTranslate()

  // Local, not the store: this is UI-only "is the round trip in flight"
  // state for disabling a control, not something any other reader needs.
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set())

  // Also local: `lastGain` only exists to hand a fresh event to whichever
  // `HabitCard` earned it. Scoping it to this hook instance rather than a
  // store means the /habits screen and the Today section never react to each
  // other's completions.
  const [lastGain, setLastGain] = useState<XpGainEvent | null>(null)
  const gainNonceRef = useRef(0)

  // Ref, not state: a re-render on undo would be wasted work — only `complete`
  // ever reads this, right after the fact.
  const recentUndosRef = useRef<Map<string, number>>(new Map())

  const markPending = useCallback((habitId: string) => {
    setPending((current) => new Set(current).add(habitId))
  }, [])

  const clearPending = useCallback((habitId: string) => {
    setPending((current) => {
      if (!current.has(habitId)) {
        return current
      }

      const next = new Set(current)
      next.delete(habitId)

      return next
    })
  }, [])

  const complete = useCallback(
    async (habitId: string) => {
      markPending(habitId)

      try {
        const outcome = await useHabitStore.getState().completeHabit(habitId, today)

        if (outcome === null) {
          return null
        }

        const lastUndoAt = recentUndosRef.current.get(habitId)
        const isUndoRecheck =
          lastUndoAt !== undefined && Date.now() - lastUndoAt < RECENT_UNDO_WINDOW_MS

        if (isUndoRecheck) {
          recentUndosRef.current.delete(habitId)
        } else {
          const ui = useUiStore.getState()
          const allDone = isTodayFullyDone(today)
          ui.emitReaction(reactionFor(outcome, allDone))

          if (isPlainCompletion(outcome)) {
            gainNonceRef.current += 1
            setLastGain({ habitId, xp: outcome.xpGained, nonce: gainNonceRef.current })
          } else {
            // Level up, unlock and comeback boost all carry a message the
            // contextual badge cannot — that stays a toast (design §10).
            ui.pushToast({ message: messageFor(t, outcome), tone: 'celebrate' })
          }
        }

        return outcome
      } catch {
        useUiStore.getState().pushToast({ message: t('common.error.save'), tone: 'info' })

        return null
      } finally {
        clearPending(habitId)
      }
    },
    [today, t, markPending, clearPending],
  )

  const undo = useCallback(
    async (habitId: string) => {
      markPending(habitId)

      try {
        await useHabitStore.getState().undoCompletion(habitId, today)
        recentUndosRef.current.set(habitId, Date.now())
        useUiStore.getState().pushToast({ message: t('habits.toast.undo'), tone: 'info' })
      } catch {
        useUiStore.getState().pushToast({ message: t('common.error.save'), tone: 'info' })
      } finally {
        clearPending(habitId)
      }
    },
    [today, t, markPending, clearPending],
  )

  const toggle = useCallback(
    (habitId: string, isCompletedToday: boolean) => {
      if (isCompletedToday) {
        void undo(habitId)

        return
      }

      void complete(habitId)
    },
    [complete, undo],
  )

  // Read through `getState()` rather than subscribing: this hook only ever
  // writes, so subscribing would re-render every caller on unrelated store
  // changes.
  return useMemo(
    () => ({ complete, undo, toggle, pendingHabitIds: Array.from(pending), lastGain }),
    [complete, undo, toggle, pending, lastGain],
  )
}
