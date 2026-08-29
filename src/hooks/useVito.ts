import { useMemo } from 'react'
import { calculateLevel } from '../domain/progression/xp'
import { daysBetween, todayKey } from '../domain/shared/date'
import type { EvolutionStage } from '../domain/vito/evolution'
import { getEvolutionStage } from '../domain/vito/evolution'
import type { Mood } from '../domain/vito/mood'
import { deriveMood } from '../domain/vito/mood'
import { useProgressStore } from '../stores/progressStore'
import { useVitoStore } from '../stores/vitoStore'
import type { DateKey, EquippedItems } from '../types/models'
import { useTodayHabits } from './useTodayHabits'

/**
 * Everything the companion needs to be drawn, all of it derived.
 *
 * Mood, evolution stage and level are never stored (design §4), so this hook is
 * the single place where progress and today's list are turned into them. The
 * rules themselves stay in `domain/vito/**` — this file assembles the input and
 * hands it over, it does not decide what "thriving" means.
 */

export interface VitoView {
  mood: Mood
  stage: EvolutionStage
  level: number
  momentum: number
  daysSinceLastActivity: number
  /** completed / scheduled today, 0..1. Zero on a rest day, never a penalty. */
  todayCompletionRatio: number
  /** Nothing scheduled today. */
  restDay: boolean
  /** Something was scheduled today and all of it is done. */
  allDone: boolean
  equippedItems: EquippedItems
  unlockedItemIds: string[]
  isLoading: boolean
}

export function useVito(today: DateKey = todayKey()): VitoView {
  const progress = useProgressStore((state) => state.progress)
  const progressStatus = useProgressStore((state) => state.status)
  const vito = useVitoStore((state) => state.vito)
  const { completedCount, scheduledCount, allDone, restDay, isLoading } =
    useTodayHabits(today)

  return useMemo(() => {
    const level = calculateLevel(progress.totalXp)
    const todayCompletionRatio =
      scheduledCount === 0 ? 0 : completedCount / scheduledCount

    // A user who has never completed anything has not been away — they have not
    // arrived yet. Zero keeps them out of the `resting` rule, the same reading
    // `habitStore` uses when it counts missed days.
    const daysSinceLastActivity =
      progress.lastActivityDate === null
        ? 0
        : Math.max(daysBetween(progress.lastActivityDate, today), 0)

    return {
      mood: deriveMood({
        momentum: progress.momentum,
        todayCompletionRatio,
        daysSinceLastActivity,
        isRestDay: restDay,
      }),
      stage: getEvolutionStage(level),
      level,
      momentum: progress.momentum,
      daysSinceLastActivity,
      todayCompletionRatio,
      restDay,
      allDone,
      equippedItems: vito.equippedItems,
      unlockedItemIds: vito.unlockedItemIds,
      isLoading: isLoading || progressStatus !== 'ready',
    }
  }, [
    progress,
    progressStatus,
    vito,
    today,
    completedCount,
    scheduledCount,
    allDone,
    restDay,
    isLoading,
  ])
}
