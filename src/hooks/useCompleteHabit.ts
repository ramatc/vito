import { useCallback, useMemo, useState } from 'react'
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

/** One reaction per completion, most significant event first. */
function reactionFor(outcome: CompletionOutcome): ReactionType {
  if (outcome.leveledUp) {
    return 'levelUp'
  }

  if (outcome.unlockedItemIds.length > 0) {
    return 'unlock'
  }

  return 'celebrate'
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
}

export function useCompleteHabit(today: DateKey = todayKey()): CompleteHabitActions {
  const t = useTranslate()

  // Local, not the store: this is UI-only "is the round trip in flight"
  // state for disabling a control, not something any other reader needs.
  const [pending, setPending] = useState<ReadonlySet<string>>(() => new Set())

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

        const ui = useUiStore.getState()
        ui.emitReaction(reactionFor(outcome))
        ui.pushToast({ message: messageFor(t, outcome), tone: 'celebrate' })

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
    () => ({ complete, undo, toggle, pendingHabitIds: Array.from(pending) }),
    [complete, undo, toggle, pending],
  )
}
