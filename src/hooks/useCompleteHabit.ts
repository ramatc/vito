import { useCallback, useMemo, useState } from 'react'
import { todayKey } from '../domain/shared/date'
import type { CompletionOutcome } from '../stores/habitStore'
import { useHabitStore } from '../stores/habitStore'
import type { ReactionType } from '../stores/uiStore'
import { useUiStore } from '../stores/uiStore'
import type { DateKey } from '../types/models'

/** Shown when a store action rejects for real — never for the documented no-op. */
export const SAVE_ERROR_MESSAGE = "Couldn't save that, try again."

/**
 * Turns a completion into what the user sees.
 *
 * `habitStore` returns a `CompletionOutcome` and nothing else — no copy, no
 * animation name. This hook is where that plain data becomes a reaction and a
 * message, which is what keeps the whole game engine testable without a UI.
 */

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

function messageFor(outcome: CompletionOutcome): string {
  const xp = `+${String(outcome.xpGained)} XP`

  if (outcome.leveledUp) {
    return `${xp} — level ${String(outcome.newLevel)}! Vito is growing.`
  }

  if (outcome.unlockedItemIds.length > 0) {
    return `${xp} — something new is waiting in the closet.`
  }

  if (outcome.boosted) {
    return `${xp} — welcome back bonus.`
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
        ui.pushToast({ message: messageFor(outcome), tone: 'celebrate' })

        return outcome
      } catch {
        useUiStore.getState().pushToast({ message: SAVE_ERROR_MESSAGE, tone: 'info' })

        return null
      } finally {
        clearPending(habitId)
      }
    },
    [today, markPending, clearPending],
  )

  const undo = useCallback(
    async (habitId: string) => {
      markPending(habitId)

      try {
        await useHabitStore.getState().undoCompletion(habitId, today)
        useUiStore.getState().pushToast({ message: 'Unchecked for today.', tone: 'info' })
      } catch {
        useUiStore.getState().pushToast({ message: SAVE_ERROR_MESSAGE, tone: 'info' })
      } finally {
        clearPending(habitId)
      }
    },
    [today, markPending, clearPending],
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
