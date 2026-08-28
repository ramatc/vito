import { useCallback, useMemo } from 'react'
import { todayKey } from '../domain/shared/date'
import type { CompletionOutcome } from '../stores/habitStore'
import { useHabitStore } from '../stores/habitStore'
import type { ReactionType } from '../stores/uiStore'
import { useUiStore } from '../stores/uiStore'
import type { DateKey } from '../types/models'

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
   * something people do; it should be quiet, not an error.
   */
  complete(habitId: string): Promise<CompletionOutcome | null>
  /** Un-checks today's completion, for a mis-tap. */
  undo(habitId: string): Promise<void>
}

export function useCompleteHabit(today: DateKey = todayKey()): CompleteHabitActions {
  const complete = useCallback(
    async (habitId: string) => {
      const outcome = await useHabitStore.getState().completeHabit(habitId, today)

      if (outcome === null) {
        return null
      }

      const ui = useUiStore.getState()
      ui.emitReaction(reactionFor(outcome))
      ui.pushToast({ message: messageFor(outcome), tone: 'celebrate' })

      return outcome
    },
    [today],
  )

  const undo = useCallback(
    async (habitId: string) => {
      await useHabitStore.getState().undoCompletion(habitId, today)
      useUiStore.getState().pushToast({ message: 'Unchecked for today.', tone: 'info' })
    },
    [today],
  )

  // Read through `getState()` rather than subscribing: this hook only ever
  // writes, so subscribing would re-render every caller on unrelated store
  // changes.
  return useMemo(() => ({ complete, undo }), [complete, undo])
}
