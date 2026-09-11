/**
 * The Habit Reports per-row palette. Index-based rather than random, so the
 * same habit always lands on the same color between renders and sessions —
 * a habit's row color is part of recognizing it at a glance, not a fresh coat
 * of paint every time the report opens.
 */

export interface HabitPaletteSlot {
  bgClass: string
  fillClass: string
  ringClass: string
}

export const HABIT_PALETTE: readonly HabitPaletteSlot[] = [
  {
    bgClass: 'bg-report-sprout-bg',
    fillClass: 'bg-report-sprout-fill',
    ringClass: 'ring-report-sprout-fill',
  },
  {
    bgClass: 'bg-report-sky-bg',
    fillClass: 'bg-report-sky-fill',
    ringClass: 'ring-report-sky-fill',
  },
  {
    bgClass: 'bg-report-blossom-bg',
    fillClass: 'bg-report-blossom-fill',
    ringClass: 'ring-report-blossom-fill',
  },
  {
    bgClass: 'bg-report-honey-bg',
    fillClass: 'bg-report-honey-fill',
    ringClass: 'ring-report-honey-fill',
  },
  {
    bgClass: 'bg-report-lilac-bg',
    fillClass: 'bg-report-lilac-fill',
    ringClass: 'ring-report-lilac-fill',
  },
  {
    bgClass: 'bg-report-clay-bg',
    fillClass: 'bg-report-clay-fill',
    ringClass: 'ring-report-clay-fill',
  },
]

/** Wraps rather than throws past six habits — the palette repeats, it never runs out. */
export function habitPaletteSlot(indexInList: number): HabitPaletteSlot {
  return HABIT_PALETTE[indexInList % HABIT_PALETTE.length]
}
