import { ProgressBar } from '../../components/ui/ProgressBar'

/**
 * Level and the XP band under it. Presentational: the fraction arrives already
 * derived from the curve by `useProgress`, and both strings arrive resolved.
 *
 * Naming the level and choosing between the band line and the ceiling line are
 * both copy decisions, so they belong to `ProgressSection` — the one file in
 * this feature that may read a store. What stays here is the XP bar as a named
 * surface: the seam Home composes and the dark-mode sweep will style.
 */

export interface XpBarProps {
  /** Fraction 0..1 through the current level band. */
  levelProgress: number
  /** The level, named, e.g. "Level 4". */
  label: string
  /** The band line, e.g. "40 / 183 XP to level 5", or the ceiling statement. */
  hint: string
  className?: string
}

export function XpBar({ levelProgress, label, hint, className }: XpBarProps) {
  return (
    <ProgressBar className={className} value={levelProgress} label={label} hint={hint} />
  )
}
