import type { DateKey } from '../../types/models'

/**
 * Shared day-status vocabulary for per-day habit history, used by the
 * all-habits weekly report (`weeklyReport.ts`).
 */

export type HabitDayStatus = 'completed' | 'missed' | 'rest' | 'pending'

export interface HabitHeatmapDay {
  date: DateKey
  status: HabitDayStatus
}
